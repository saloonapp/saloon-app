import {Component, Input, OnChanges, SimpleChange} from "@angular/core";
import {NavController} from "ionic-angular/index";
import * as _ from "lodash";
import {SessionFull} from "../models/Session";
import {ISlot, Slot, SlotWithSessions, SlotHelper} from "../models/Slot";
import {EventData} from "../services/event.data";
import {DateHelper} from "../../common/utils/date";
import {RatingComponent} from "../../common/components/rating.component";
import {TimePeriodPipe} from "../../common/pipes/datetime.pipe";
import {MapPipe, JoinPipe} from "../../common/pipes/array.pipe";
import {SessionPage} from "../session.page";
import {SessionFilterPage} from "../session-filter.page";

@Component({
    selector: 'schedule',
    pipes: [TimePeriodPipe, MapPipe, JoinPipe],
    directives: [RatingComponent],
    styles: [`
.schedule {
    position: relative;
}
.schedule-item, .empty-slot-item {
    position: absolute;
    box-sizing: border-box;
    border-radius: 5px;
    padding: 5px;
    overflow: hidden;
    background: #F4F4F4;
    border: solid 1px #E0E0E0;
}
.schedule-item h2, .empty-slot-item h2 {
    margin: 0 0 2px;
    font-size: 1.6rem;
    font-weight: normal;
}
.schedule-item.small h2 {
    font-size: 1.2rem;
}
.schedule-item p, .empty-slot-item p {
    margin: 0 0 2px;
    font-size: 1.2rem;
    line-height: normal;
    color: #666;
}
.schedule-item.small p {
    font-size: 0.9rem;
}
.empty-slot-item {
    border-style: dashed;
    border-width: 2px;
    opacity: 0.5;
}
.empty-slot-item h2 {
    color: #666;
}
.now {
    position: absolute;
    width: 100%;
    height: 0px;
    border-top: 3px dashed #387ef5;
    text-align: right;
    padding-right: 5px;
    color: #387ef5;
}
    `],
    template: `
<div class="schedule" [ngStyle]="{'height': totalHeight+'px'}">
    <div class="schedule-item" [class.small]="isSmall(item)" *ngFor="let item of items" (click)="goToSession(item.data)" (hold)="goToPeriod(item.data)" [ngStyle]="item.style()">
        <p>{{item.data.start | timePeriod:item.data.end}} - {{item.data.place}}</p>
        <h2>{{item.data.name}} <rating *ngIf="getRating(item.data) > 0" [value]="getRating(item.data)"></rating></h2>
        <p>{{item.data.speakers | map:'name' | join:', '}}</p>
    </div>
    <div class="empty-slot-item" [class.small]="isSmall(item)" *ngFor="let item of slots" (click)="goToSlot(item.data)" [ngStyle]="item.style()">
        <p>{{item.data.start | timePeriod:item.data.end}}</p>
        <h2>
            {{item.data.sessions.length}} session{{item.data.sessions.length > 1 ? 's' : ''}}
            {{item.data.sessions.length === 1 ? '('+item.data.sessions[0].name+')' : ''}}
        </h2>
    </div>
    <div id="now" class="now" *ngIf="now > 0" style="top: {{now}}px;">now</div>
</div>
`
})
// TODO :
//  bug when a (long) session is in same time of many successive (short) sessions : wrong width/position calculation
//  hold on session : open session selection for slots during the session (cf http://roblouie.com/article/198/using-gestures-in-the-ionic-2-beta)
//  add day/time on the left
//  add a 'now' line & button
//  pass sessions & slots to Component to have a more generic component (no filter on favorites...)
export class ScheduleComponent implements OnChanges {
    @Input() sessions: SessionFull[];
    totalHeight: number;
    items: ScheduleItem[];
    slots: ScheduleItem[];
    now: number;
    constructor(private _nav: NavController,
                private _eventData: EventData) {}

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if(changes && changes['sessions']) { this.compute(changes['sessions'].currentValue); }
    }

    update() {
        this.compute(this.sessions);
    }

    isSmall(item: ScheduleItem) {
        return item.width < 33 || (item.width < 50 && item.data.end - item.data.start < 1000*60*30); // 30 min
    }

    getRating(session: SessionFull): number {
        return this._eventData.getSessionRating(session);
    }

    goToSlot(slot: Slot) {
        this._nav.push(SessionFilterPage, {
            filter: { slot: slot }
        });
    }

    goToPeriod(sessionFull: SessionFull) {
        alert('TODO: open session selector for slots during this session');
    }

    goToSession(sessionFull: SessionFull) {
        this._nav.push(SessionPage, {
            sessionItem: sessionFull.toItem()
        });
    }

    private compute(sessions: SessionFull[]) {
        const favorites: SessionFull[] = sessions.filter(s => this._eventData.getSessionFavorite(s));
        const sessionSlots: SlotWithSessions[] = SlotHelper.extract(sessions);
        [this.totalHeight, this.items, this.slots, this.now] = ScheduleBuilder.compute(favorites, sessionSlots);
    }
}

class ScheduleItem {
    constructor(public data: ISlot,
                public top: number,
                public height: number,
                public width: number,
                public left: number) {}
    style(): any {
        return {
            top: this.top+'px',
            height: this.height+'px',
            width: this.width+'%',
            left: this.left+'%'
        };
    }
}


class ScheduleBuilder {
    private static pxPerMin = 3;
    private static msPerMin = 1000 * 60;

    public static compute(favorites:SessionFull[], slots:SlotWithSessions[]): any[] {
        const now = DateHelper.now();
        const globalStart  : number             = _.min(_.map(slots, s => s.start));
        const globalEnd    : number             = _.max(_.map(slots, s => s.end));
        const totalHeight  : number             = this.toPx(globalEnd - globalStart);
        const nowOffset    : number             = globalStart < now && now < globalEnd ? this.toPx(now - globalStart) : -1;
        const emptySlots   : SlotWithSessions[] = slots.filter(slot => favorites.find(s => this.hasConflicts(slot, s)) === undefined);
        const scheduleItems: ScheduleItem[]     = this.computePosition(favorites, globalStart);
        const scheduleSlots: ScheduleItem[]     = this.computePosition(emptySlots, globalStart);
        return [totalHeight, scheduleItems, scheduleSlots, nowOffset];
    }

    private static computePosition(slots: ISlot[], globalStart: number): ScheduleItem[] {
        // create a cache to store slot calculated data
        const slotData = {};
        slots.forEach(s => {
            slotData[s.uuid] = {
                conflicts: this.getConflicts(s, slots),
                width: null,
                left: null
            };
        });

        // get all time intervals and get their mean time value
        const intervals = _.uniq(_.flatten(slots.map(s => [s.start, s.end]))).sort((e1, e2) => e2-e1).map((elt, i, arr) => {
            if(i+1 < arr.length) {
                return Math.round((elt + arr[i+1]) / 2);
            } else {
                return elt;
            }
        });

        // attach related slots sorted by number of conflicts (desc) to intervals and sort them by number of slots (desc)
        const intervalsWithSlots = intervals.map(t => {
            return {
                time: t,
                slots: slots.filter(s => s.start < t && t < s.end).sort((e1, e2) => slotData[e2.uuid].conflicts.length - slotData[e1.uuid].conflicts.length)
            };
        }).sort((e1, e2) => e2.slots.length - e1.slots.length);

        // calcul width & left params :
        //  - width : not used width (if slot is part of other intervals...) divided equally
        //  - left : cumulated width of previous slots (they are already ordered)
        intervalsWithSlots.map(t => {
            const slotsWithWidth = t.slots.filter(s => slotData[s.uuid].width !== null);
            const usedWidth = _.sum(slotsWithWidth.map(s => slotData[s.uuid].width));
            let curWidth = 0;
            t.slots.forEach(s => {
                if(slotData[s.uuid].width === null){ slotData[s.uuid].width = (100-usedWidth)/(t.slots.length - slotsWithWidth.length); }
                if(slotData[s.uuid].left === null){ slotData[s.uuid].left = curWidth; }
                curWidth = curWidth + slotData[s.uuid].width;
            });
        });

        // return formated data
        return slots.map(s => {
            const top    = this.toPx(s.start - globalStart);
            const height = this.toPx(s.end - s.start);
            const width  = slotData[s.uuid].width;
            const left   = slotData[s.uuid].left;
            return new ScheduleItem(s, top, height, width, left);
        });
    }
    private static getConflicts(slot: Slot, slots: Slot[]): Slot[] {
        return slots.filter(s => {
            return this.hasConflicts(slot, s);
        });
    }
    private static hasConflicts(s1: Slot, s2: Slot): boolean {
        const startBetween = s1.start < s2.start && s2.start < s1.end;
        const endBetween   = s1.start < s2.end && s2.end < s1.end;
        const isIncluded   = s2.start <= s1.start && s1.end <= s2.end;
        return startBetween || endBetween || isIncluded;
    }
    private static toPx(msTime: number): number {
        return msTime * this.pxPerMin / this.msPerMin;
    }
}

import {Component, Input, OnChanges, SimpleChange} from "angular2/core";
import {NavController} from "ionic-angular/index";
import * as _ from "lodash";
import {SessionFull} from "../models/SessionFull";
import {Slot, SlotHelper} from "../models/Slot";
import {EventData} from "../services/event.data";
import {TimePeriodPipe} from "../../common/pipes/datetime.pipe";
import {MapPipe, JoinPipe} from "../../common/pipes/array.pipe";
import {SessionPage} from "../session.page";
import {SessionFilterPage} from "../session-filter.page";

interface ScheduleItem {
    data: Slot;
    position: string;
}

@Component({
    selector: 'schedule',
    pipes: [TimePeriodPipe, MapPipe, JoinPipe],
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
.schedule-item p, .empty-slot-item p {
    margin: 0 0 2px;
    font-size: 1.2rem;
    line-height: normal;
    color: #666;
}
.empty-slot-item {
    border-style: dashed;
    border-width: 2px;
    opacity: 0.5;
}
.empty-slot-item h2 {
    color: #666;
}
    `],
    template: `
<div class="schedule" style="height: {{totalHeight}}px;">
    <div class="schedule-item" *ngFor="#item of items" (click)="goToSession(item.data)" (hold)="openSlotsForSession(item.data)" style="{{item.position}}">
        <p>{{item.data.start | timePeriod:item.data.end}} - {{item.data.place}}</p>
        <h2>{{item.data.name}}</h2>
        <p>{{item.data.speakers | map:'name' | join:', '}}</p>
    </div>
    <div class="empty-slot-item" *ngFor="#item of slots" (click)="openSlot(item.data)" style="{{item.position}}">
        <p>{{item.data.start | timePeriod:item.data.end}}</p>
        <h2>
            {{item.data.sessions.length}} session{{item.data.sessions.length > 1 ? 's' : ''}}
            {{item.data.sessions.length === 1 ? '('+item.data.sessions[0].name+')' : ''}}
        </h2>
    </div>
</div>
`
})
// TODO :
//  bug when a (long) session is in same time of many successive (short) sessions : wrong width/position calculation
//  hold on session : open session selection for slots during the session
//  add day/time on the left
//  add a 'now' line & button
//  pass sessions & slots to Component to have a more generic component (no filter on favorites...)
export class ScheduleComponent implements OnChanges {
    @Input() sessions: SessionFull[];
    totalHeight: number;
    items: ScheduleItem[];
    slots: ScheduleItem[];
    constructor(private _nav: NavController,
                private _eventData: EventData) {}

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if(changes && changes['sessions']) { this.compute(changes['sessions'].currentValue); }
    }

    update() {
        this.compute(this.sessions);
    }

    openSlot(slot: Slot) {
        this._nav.push(SessionFilterPage, {
            filter: {
                slot: slot
            }
        });
    }

    openSlotsForSession(sessionFull: SessionFull) {
        alert('TODO: open session selector for slots during this session');
    }

    goToSession(sessionFull: SessionFull) {
        this._nav.push(SessionPage, {
            sessionItem: SessionFull.toItem(sessionFull)
        });
    }

    private compute(sessions: SessionFull[]) {
        const favorites: SessionFull[] = sessions.filter(s => this._eventData.isFavoriteSession(s));
        const sessionSlots: Slot[] = SlotHelper.extract(sessions);
        [this.totalHeight, this.items, this.slots] = ScheduleBuilder.compute(favorites, sessionSlots);
    }
}

class ScheduleBuilder {
    private static pxPerMin = 3;
    private static msPerMin = 1000*60;

    public static compute(favorites: SessionFull[], slots: Slot[]): any[] {
        const globalStart  : number         = _.min(_.map(slots, s => s.start));
        const globalEnd    : number         = _.max(_.map(slots, s => s.end));
        const totalHeight  : number         = this.toPx(globalEnd - globalStart);
        const emptySlots   : Slot[]         = slots.filter(slot => favorites.find(s => this.isDuring(slot, s)) === undefined);
        const scheduleItems: ScheduleItem[] = this.computePosition(favorites, globalStart);
        const scheduleSlots: ScheduleItem[] = this.computePosition(emptySlots, globalStart);
        return [totalHeight, scheduleItems, scheduleSlots];
    }

    private static computePosition(slots: Slot[], globalStart: number): ScheduleItem[] {
        const slotPositions = {};
        return slots.map(slot => {
            const inParallel       : Slot[]   = this.inParallel(slot, slots);
            const possiblePositions: number[] = _.range(inParallel.length);
            const takenPositions   : number[] = inParallel.map(s => slotPositions[s.uuid]).filter(p => typeof p === 'number');
            const position         : number   = possiblePositions.find(p => takenPositions.indexOf(p) === -1);
            slotPositions[slot.uuid] = position;
            const top    = this.toPx(slot.start - globalStart);
            const height = this.toPx(slot.end - slot.start);
            const width  = 100/(inParallel.length);
            const left   = position*width;
            return {
                data: slot,
                position: 'top: '+top+'px; height: '+height+'px; width: '+width+'%; left: '+left+'%;'
            };
        });
    }
    private static inParallel(slot: Slot, slots: Slot[]): Slot[] {
        return slots.filter(s => {
            return this.isDuring(slot, s);
        });
    }
    private static isDuring(s1: Slot, s2: Slot): boolean {
        const startBetween = s1.start < s2.start && s2.start < s1.end;
        const endBetween   = s1.start < s2.end && s2.end < s1.end;
        const isIncluded   = s2.start <= s1.start && s1.end <= s2.end;
        return startBetween || endBetween || isIncluded;
    }
    private static toPx(msTime: number): number {
        return msTime * this.pxPerMin / this.msPerMin;
    }
}

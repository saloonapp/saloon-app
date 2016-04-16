import {Component, Input, OnChanges, SimpleChange} from "angular2/core";
import {NavController} from "ionic-angular/index";
import * as _ from "lodash";
import {SessionFull} from "../models/SessionFull";
import {Slot} from "../models/Slot";
import {Sort} from "../../common/utils/array";
import {EventData} from "../services/event.data";
import {TimePeriodPipe} from "../../common/pipes/datetime.pipe";
import {SessionPage} from "../session.page";

interface ScheduleItem {
    data: Slot;
    position: string;
}

@Component({
    selector: 'schedule',
    pipes: [TimePeriodPipe],
    styles: [`
.schedule {
    position: relative;
}
.schedule-item, .empty-slot-item {
    position: absolute;
    box-sizing: border-box;
    border-radius: 5px;
    overflow: hidden;
}
.schedule-item {
    background: #ccc;
    border: solid 1px #aaa;
}
.schedule-item h2 {
    margin: 0 0 2px;
    font-size: 1.6rem;
    font-weight: normal;
}
.empty-slot-item {
    background: #ccc;
    border: dashed 2px #aaa;
    opacity: 0.5;
}
    `],
    template: `
<div class="schedule" style="height: {{totalHeight}}px;">
    <div class="schedule-item" *ngFor="#item of items" (click)="goToSession(item.data)" style="{{item.position}}">
        <p>{{item.data.start | timePeriod:item.data.end}}</p>
        <h2>{{item.data.name}}</h2>
    </div>
    <div class="empty-slot-item" *ngFor="#item of slots" (click)="openSlot(item.data)" style="{{item.position}}">
         <p>{{item.data.start | timePeriod:item.data.end}}</p>
    </div>
</div>
`
})
export class ScheduleComponent implements OnChanges {
    private pxPerMin = 4;
    private msPerMin = 1000*60;
    @Input() sessions: SessionFull[];
    totalHeight: number;
    items: ScheduleItem[];
    slots: ScheduleItem[];
    constructor(private _nav: NavController,
                private _eventData: EventData) {}

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if(changes && changes['sessions']) { this.buildScheduleItems(changes['sessions'].currentValue); }
    }

    isFav(sessionFull: SessionFull): boolean {
        return this._eventData.isFavoriteSession(sessionFull);
    }

    openSlot(slot: Slot) {
        alert('TODO: choose session for this slot');
    }

    goToSession(sessionFull: SessionFull) {
        this._nav.push(SessionPage, {
            sessionItem: SessionFull.toItem(sessionFull)
        });
    }

    // TODO :
    //  bug when a (long) session is in same time of many successive (short) sessions : wrong width/position calculation
    //  click on slot : open session selection for this slot
    //  hold on session : open session selection for slots during the session
    //  show nb of session available for empty slots
    //  add day/time on the left
    //  add a 'now' line & button
    //  improve infos (hours, room...) and design
    //  pass sessions & slots to Component to have a more generic component (no filter on favorites...)
    buildScheduleItems(sessions: SessionFull[]): void {
        const slots        : Slot[]         = this.getSlots(sessions);
        const globalStart  : number         = _.min(_.map(slots, s => s.start));
        const globalEnd    : number         = _.max(_.map(slots, s => s.end));
        const favorites    : SessionFull[]  = sessions.filter(s => this.isFav(s));
        const emptySlots   : Slot[]         = slots.filter(slot => favorites.find(s => this.isDuring(slot, s)) === undefined);
        const scheduleItems: ScheduleItem[] = this.computePosition(favorites, globalStart);
        const scheduleSlots: ScheduleItem[] = this.computePosition(emptySlots, globalStart);

        this.totalHeight = this.toPx(globalEnd - globalStart);
        this.items = scheduleItems;
        this.slots = scheduleSlots;
    }
    computePosition(slots: Slot[], globalStart: number): ScheduleItem[] {
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
    inParallel(slot: Slot, slots: Slot[]): Slot[] {
        return slots.filter(s => {
            return this.isDuring(slot, s);
        });
    }
    isDuring(s1: Slot, s2: Slot): boolean {
        const startBetween = s1.start < s2.start && s2.start < s1.end;
        const endBetween   = s1.start < s2.end && s2.end < s1.end;
        const isIncluded   = s2.start <= s1.start && s1.end <= s2.end;
        return startBetween || endBetween || isIncluded;
    }
    getSlots(sessions: SessionFull[]): Slot[] {
        const slots = [];
        let cpt = 1;
        sessions.map(session => {
            if(slots.find(s => s.start === session.start && s.end === session.end) === undefined){
                slots.push({
                    uuid: 'slot-'+(cpt++),
                    start: session.start,
                    end: session.end
                });
            }
        });
        return slots.sort((s1, s2) => Sort.num(s1.start, s2.start));
    }
    toPx(msTime: number): number {
        return msTime * this.pxPerMin / this.msPerMin;
    }
}

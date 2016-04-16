import {Component, Input, OnChanges, SimpleChange} from "angular2/core";
import {NavController} from "ionic-angular/index";
import * as _ from "lodash";
import {SessionFull} from "../models/SessionFull";
import {EventData} from "../services/event.data";
import {MapPipe} from "../../common/pipes/array.pipe";
import {SessionPage} from "../session.page";

@Component({
    selector: 'schedule',
    styles: [`
.schedule {
    position: relative;
}
.schedule-item {
    position: absolute;
    box-sizing: border-box;
    background: #ccc;
    border: solid 1px #aaa;
    border-radius: 5px;
    overflow: hidden;
}
.schedule-item h2 {
margin: 0 0 2px;
    font-size: 1.6rem;
    font-weight: normal;
}
    `],
    template: `
<div class="schedule" style="height: {{totalHeight}}px;">
    <div class="schedule-item" *ngFor="#item of items"
         style="width: {{item.width}}%; height: {{item.height}}px; top: {{item.top}}px; left: {{item.left}}%;">
        <h2>{{item.session.name}}</h2>
    </div>
</div>
`,
    pipes: [MapPipe]
})
export class ScheduleComponent implements OnChanges {
    private pxPerMin = 4;
    private msPerMin = 1000*60;
    @Input() sessions: SessionFull[];
    totalHeight: number;
    favorites: SessionFull[];
    items: any[];
    constructor(private _nav: NavController,
                private _eventData: EventData) {}

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if(changes && changes['sessions']) { this.buildScheduleItems(changes['sessions'].currentValue); }
    }

    isFav(sessionFull: SessionFull): boolean {
        return this._eventData.isFavoriteSession(sessionFull);
    }

    goToSession(sessionFull: SessionFull) {
        this._nav.push(SessionPage, {
            sessionItem: SessionFull.toItem(sessionFull)
        });
    }

    // TODO :
    //  bug when a (long) session is in same time of many successive (short) sessions : wrong width calculation
    //  add placeholders to choose session for slots with no selected sessions
    //  improve infos (hours, room...) and design
    buildScheduleItems(sessions: SessionFull[]): void {
        console.log('buildScheduleItems() sessions', sessions);
        const dates = _.flatten(_.map(sessions, s => [s.start, s.end]));
        const start = _.min(dates);
        const end = _.max(dates);
        this.totalHeight = this.toPx(end-start);
        this.favorites = sessions.filter(s => this.isFav(s));
        const sessionPositions = {};
        const itemsWithHeight = this.favorites.map(s => {
            const inSameTime = this.favorites.filter(s2 => {
                const startDuring = s.start < s2.start && s2.start < s.end;
                const endDuring = s.start < s2.end && s2.end < s.end;
                const isIncluded = s2.start <= s.start && s.end <= s2.end;
                return startDuring || endDuring || isIncluded;
            }).map(s => s.uuid);
            const takenPositions: number[] = inSameTime.map(id => sessionPositions[id]).filter(p => typeof p === 'number');
            const possiblePositions: number[] = _.range(inSameTime.length);
            const position: number = possiblePositions.find(p => takenPositions.indexOf(p) === -1);
            sessionPositions[s.uuid] = position;
            return {
                session: s,
                top: this.toPx(s.start-start),
                height: this.toPx(s.end-s.start),
                width: 100/(inSameTime.length),
                left: position*(100/(inSameTime.length))
            };
        });
        console.log('buildScheduleItems() items', itemsWithHeight);
        this.items = itemsWithHeight;
    }
    toPx(msTime: number): number {
        return msTime*this.pxPerMin/this.msPerMin;
    }
}

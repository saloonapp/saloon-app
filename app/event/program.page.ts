import {OnInit, ViewChildren, QueryList} from "angular2/core";
import {Page} from "ionic-angular";
import {EventFull} from "./models/EventFull";
import {SessionFull} from "./models/SessionFull";
import {DateHelper} from "../common/utils/date";
import {EventData} from "./services/event.data";
import {WeekDayPipe, DatePipe} from "../common/pipes/datetime.pipe";
import {GroupByPipe, SortByPipe} from "../common/pipes/array.pipe";
import {CapitalizePipe} from "../common/pipes/text.pipe";
import {ScheduleComponent} from "./components/schedule.component";
import {DOMHelper} from "../common/utils/DOM";

@Page({
    directives: [ScheduleComponent],
    pipes: [DatePipe, WeekDayPipe, CapitalizePipe, GroupByPipe, SortByPipe],
    styles: [`
.item h2 {
    white-space: initial;
}
h3 {
    padding: 5px;
    padding-left: 10px;
}
    `],
    template: `
<ion-navbar *navbar>
    <button menuToggle><ion-icon name="menu"></ion-icon></button>
    <ion-title>Mon programme</ion-title>
    <ion-buttons end>
        <button (click)="scrollToNow()" [hidden]="!(eventFull && isNow(eventFull))"><ion-icon name="arrow-round-down"></ion-icon></button>
    </ion-buttons>
</ion-navbar>
<ion-content class="program-page">
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <div *ngIf="eventFull">
        <div *ngFor="#daySessions of eventFull.sessions | groupBy:sessionDay | sortBy:'key'">
            <h3>{{daySessions.key | weekDay | capitalize}} {{daySessions.key | date}}</h3>
            <schedule [sessions]="daySessions.values"></schedule>
        </div>
    </div>
</ion-content>
`
})
export class ProgramPage implements OnInit {
    eventFull: EventFull;
    @ViewChildren(ScheduleComponent) schedules: QueryList<ScheduleComponent>;
    constructor(private _eventData: EventData) {}

    ngOnInit() {
        setTimeout(() => {
            this._eventData.getCurrentEventFull().then(eventFull => {
                this.eventFull = eventFull;
            });
        }, 600);
    }

    onPageWillEnter() {
        if(this.schedules){
            this.schedules.map(s => s.update());
        }
    }

    isNow(event: EventFull): boolean {
        const now = DateHelper.now();
        return event.start && event.end && event.start < now && now < event.end;
    }

    sessionDay(sessionFull: SessionFull): number {
        return DateHelper.dayTimestamp(sessionFull.start);
    }

    scrollToNow() {
        DOMHelper.scrollTo(document.getElementById('now'), -(56+69));
    }
}

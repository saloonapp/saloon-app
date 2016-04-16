import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import * as moment from "moment";
import {EventFull} from "./models/EventFull";
import {SessionFull} from "./models/SessionFull";
import {EventData} from "./services/event.data";
import {DatePipe} from "../common/pipes/datetime.pipe";
import {GroupByPipe, SortByPipe} from "../common/pipes/array.pipe";
import {ScheduleComponent} from "./components/schedule.component";

@Page({
    directives: [ScheduleComponent],
    pipes: [DatePipe, GroupByPipe, SortByPipe],
    styles: [`
.item h2 {
    white-space: initial;
}
    `],
    template: `
<ion-navbar *navbar>
    <ion-title>Mon programme</ion-title>
</ion-navbar>
<ion-content class="program-page">
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <div *ngIf="eventFull">
        <div *ngFor="#daySessions of eventFull.sessions | groupBy:sessionDay | sortBy:'key'">
            <h3>{{daySessions.key | date}}</h3>
            <schedule [sessions]="daySessions.values"></schedule>
        </div>
    </div>
</ion-content>
`
})
export class ProgramPage implements OnInit {
    eventFull: EventFull;
    constructor(private _eventData: EventData) {}

    ngOnInit() {
        setTimeout(() => {
            this._eventData.getCurrentEventFull().then(eventFull => {
                this.eventFull = eventFull;
            });
        }, 600);
    }

    sessionDay(sessionFull: SessionFull): number {
        return moment(moment(sessionFull.start).format('L'), 'L').valueOf();
    }
}

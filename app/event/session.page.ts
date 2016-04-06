import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {NavController, NavParams} from "ionic-angular/index";
import {SessionFull} from "./models/SessionFull";
import {SessionItem} from "./models/SessionItem";
import {AttendeeItem} from "./models/AttendeeItem";
import {WeekDayPipe, TimePeriodPipe} from "../common/pipes/datetime.pipe";
import {CapitalizePipe} from "../common/pipes/text.pipe";
import {EventService} from "./services/event.service";
import {AttendeePage} from "./attendee.page";

@Page({
    template: `
<ion-navbar *navbar>
    <ion-title>Session</ion-title>
</ion-navbar>
<ion-content class="session-page">
    <div padding>
        <h1>{{sessionItem.name}}</h1>
        <p>{{sessionItem.start | weekDay | capitalize}}, {{sessionItem.start | timePeriod:sessionItem.end}}</p>
        <p>{{sessionItem.place}}</p>
        <p>{{sessionItem.description}}</p>
    </div>
    <ion-list *ngIf="sessionFull && sessionFull.speakers.length > 0">
        <ion-list-header>Speakers</ion-list-header>
        <ion-item *ngFor="#attendee of sessionFull.speakers" (click)="goToAttendee(attendee)">
            <ion-avatar item-left><img [src]="attendee.avatar"></ion-avatar>
            <h2>{{attendee.name}}</h2>
            <p>{{(attendee.job ? attendee.job+', ' : '')+attendee.company}}</p>
        </ion-item>
    </ion-list>
</ion-content>
`,
    pipes: [WeekDayPipe, CapitalizePipe, TimePeriodPipe]
})
export class SessionPage implements OnInit {
    sessionItem: SessionItem;
    sessionFull: SessionFull;
    constructor(private _eventService: EventService,
                private _nav: NavController,
                private _navParams: NavParams) {}

    ngOnInit() {
        this.sessionItem = <SessionItem> this._navParams.get('sessionItem');
        this._eventService.getSessionFromCurrent(this.sessionItem.uuid).then(session => this.sessionFull = session);
    }

    goToAttendee(attendeeItem: AttendeeItem) {
        this._nav.push(AttendeePage, {
            attendeeItem: attendeeItem
        });
    }
}

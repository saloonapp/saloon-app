import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {NavController, NavParams} from "ionic-angular/index";
import {SessionFull} from "../models/SessionFull";
import {SessionItem} from "../models/SessionItem";
import {AttendeeItem} from "../models/AttendeeItem";
import {WeekDayPipe, TimePipe} from "../common/pipes/datetime.pipe";
import {CapitalizePipe} from "../common/pipes/text.pipe";
import {EventService} from "../common/event.service";
import {AttendeePage} from "./attendee.page";

@Page({
    template: `
<ion-navbar *navbar>
    <ion-title>Session</ion-title>
</ion-navbar>
<ion-content class="session-page">
    <div padding>
        <h1>{{sessionItem.name}}</h1>
        <p>{{sessionItem.start | weekDay | capitalize}}, {{sessionItem.start | time}}-{{sessionItem.end | time}}</p>
        <p>{{sessionItem.place}}</p>
        <p>{{sessionItem.description}}</p>
    </div>
    <ion-list *ngIf="sessionFull && sessionFull.speakers.length > 0">
        <ion-list-header>Speakers</ion-list-header>
        <ion-item *ngFor="#speaker of sessionFull.speakers" (click)="goToAttendee(speaker)">
            <ion-avatar item-left>
                <img src="{{speaker.avatar}}">
            </ion-avatar>
            <h2>{{speaker.name}}</h2>
            <p class="nowrap lines2">{{speaker.description}}</p>
        </ion-item>
    </ion-list>
</ion-content>
`,
    pipes: [WeekDayPipe, TimePipe, CapitalizePipe]
})
export class SessionPage implements OnInit {
    sessionItem: SessionItem;
    sessionFull: SessionFull;
    constructor(private _eventService: EventService,
                private _nav: NavController,
                private _navParams: NavParams) {}

    ngOnInit() {
        this.sessionItem = <SessionItem> this._navParams.get('sessionItem');
        this.sessionFull = this._eventService.getSessionFromCurrent(this.sessionItem.uuid);
    }

    goToAttendee(attendeeItem: AttendeeItem) {
        this._nav.push(AttendeePage, {
            attendeeItem: attendeeItem
        });
    }
}

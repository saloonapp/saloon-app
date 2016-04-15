import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {NavController, NavParams} from "ionic-angular/index";
import {SessionFull} from "./models/SessionFull";
import {SessionItem} from "./models/SessionItem";
import {AttendeeItem} from "./models/AttendeeItem";
import {WeekDayPipe, TimePeriodPipe} from "../common/pipes/datetime.pipe";
import {CapitalizePipe} from "../common/pipes/text.pipe";
import {NotEmptyPipe, JoinPipe} from "../common/pipes/array.pipe";
import {EventData} from "./services/event.data";
import {AttendeePage} from "./attendee.page";

@Page({
    template: `
<ion-navbar *navbar>
    <ion-title>Session</ion-title>
    <ion-buttons end>
        <button (click)="toggleFav(sessionItem)">
            <ion-icon name="star" [hidden]="!isFav(sessionItem)"></ion-icon>
            <ion-icon name="star-outline" [hidden]="isFav(sessionItem)"></ion-icon>
        </button>
    </ion-buttons>
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
            <p>{{[attendee.job, attendee.company] | notEmpty | join:', '}}</p>
        </ion-item>
    </ion-list>
</ion-content>
`,
    pipes: [WeekDayPipe, CapitalizePipe, TimePeriodPipe, NotEmptyPipe, JoinPipe]
})
export class SessionPage implements OnInit {
    sessionItem: SessionItem;
    sessionFull: SessionFull;
    constructor(private _nav: NavController,
                private _navParams: NavParams,
                private _eventData: EventData) {}

    ngOnInit() {
        this.sessionItem = <SessionItem> this._navParams.get('sessionItem');
        this._eventData.getSessionFromCurrent(this.sessionItem.uuid).then(session => this.sessionFull = session);
    }

    isFav(sessionItem: SessionItem): boolean {
        return this._eventData.isFavoriteSession(sessionItem);
    }

    toggleFav(sessionItem: SessionItem) {
        if(this.isFav(sessionItem)){
            this._eventData.unfavoriteSession(sessionItem);
        } else {
            this._eventData.favoriteSession(sessionItem);
        }
    }

    goToAttendee(attendeeItem: AttendeeItem) {
        this._nav.push(AttendeePage, {
            attendeeItem: attendeeItem
        });
    }
}

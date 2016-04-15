import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {NavController, NavParams} from "ionic-angular/index";
import {AttendeeFull} from "./models/AttendeeFull";
import {AttendeeItem} from "./models/AttendeeItem";
import {SessionItem} from "./models/SessionItem";
import {ExponentItem} from "./models/ExponentItem";
import {EventData} from "./services/event.data";
import {TimePeriodPipe, WeekDayPipe} from "../common/pipes/datetime.pipe";
import {CapitalizePipe} from "../common/pipes/text.pipe";
import {NotEmptyPipe, JoinPipe} from "../common/pipes/array.pipe";
import {SessionPage} from "./session.page";
import {ExponentPage} from "./exponent.page";

@Page({
    styles: [`
.item h2, .item p {
    white-space: initial;
}
    `],
    template: `
<ion-navbar *navbar>
    <ion-title>Participant</ion-title>
</ion-navbar>
<ion-content class="attendee-page">
    <div padding>
        <h1>{{attendeeItem.name}}</h1>
        <h4>{{[attendeeItem.job, attendeeItem.company] | notEmpty | join:', '}}</h4>
        <p>{{attendeeItem.description}}</p>
    </div>
    <ion-list *ngIf="attendeeFull && attendeeFull.exponents.length > 0">
        <ion-list-header>Exposants</ion-list-header>
        <ion-item *ngFor="#exponent of attendeeFull.exponents" (click)="goToExponent(exponent)">
            <ion-avatar item-left><img [src]="exponent.logo"></ion-avatar>
            <h2>{{exponent.name}}</h2>
            <p class="nowrap lines2">{{exponent.description}}</p>
        </ion-item>
    </ion-list>
    <ion-list *ngIf="attendeeFull && attendeeFull.sessions.length > 0">
        <ion-list-header>Sessions</ion-list-header>
        <ion-item *ngFor="#session of attendeeFull.sessions" (click)="goToSession(session)">
            <h2>{{session.name}}</h2>
            <p>{{[session.place, session.category, (session.start|weekDay|capitalize)+' '+(session.start|timePeriod:session.end)] | notEmpty | join:' - '}}</p>
            <button clear item-right (click)="toggleFav(session);$event.stopPropagation();">
                <ion-icon name="star" [hidden]="!isFav(session)"></ion-icon>
                <ion-icon name="star-outline" [hidden]="isFav(session)"></ion-icon>
            </button>
        </ion-item>
    </ion-list>
</ion-content>
`,
    pipes: [TimePeriodPipe, WeekDayPipe, CapitalizePipe, NotEmptyPipe, JoinPipe]
})
export class AttendeePage implements OnInit {
    attendeeItem: AttendeeItem;
    attendeeFull: AttendeeFull;
    constructor(private _nav: NavController,
                private _navParams: NavParams,
                private _eventData: EventData) {}

    ngOnInit() {
        this.attendeeItem = <AttendeeItem> this._navParams.get('attendeeItem');
        this._eventData.getAttendeeFromCurrent(this.attendeeItem.uuid).then(attendee => this.attendeeFull = attendee);
    }

    isFav(sessionItem: SessionItem) {
        return this._eventData.isFavoriteSession(sessionItem);
    }

    toggleFav(sessionItem: SessionItem) {
        if(this.isFav(sessionItem)){
            this._eventData.unfavoriteSession(sessionItem);
        } else {
            this._eventData.favoriteSession(sessionItem);
        }
    }

    goToExponent(exponentItem: ExponentItem) {
        this._nav.push(ExponentPage, {
            exponentItem: exponentItem
        });
    }

    goToSession(sessionItem: SessionItem) {
        this._nav.push(SessionPage, {
            sessionItem: sessionItem
        });
    }
}

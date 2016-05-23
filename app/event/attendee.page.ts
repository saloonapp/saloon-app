import {OnInit} from "@angular/core";
import {Page} from 'ionic-angular';
import {NavController, NavParams} from "ionic-angular/index";
import {EventItem} from "./models/Event";
import {AttendeeItem, AttendeeFull} from "./models/Attendee";
import {SessionItem} from "./models/Session";
import {ExponentItem} from "./models/Exponent";
import {DateHelper} from "../common/utils/date";
import {EventData} from "./services/event.data";
import {SessionItemComponent} from "./components/session-item.component";
import {ExponentItemComponent} from "./components/exponent-item.component";
import {NotEmptyPipe, JoinPipe} from "../common/pipes/array.pipe";
import {AttendeeFilterPage} from "./attendee-filter.page";
import {SessionPage} from "./session.page";
import {ExponentPage} from "./exponent.page";

@Page({
    pipes: [NotEmptyPipe, JoinPipe],
    directives: [SessionItemComponent, ExponentItemComponent],
    styles: [`
.attendee-card {
    text-align: center;
}
.attendee-card img {
    border-radius: 50%;
    height: 100px;
}
.attendee-card h1, .attendee-card h4 {
    margin: 0px;
}
    `],
    template: `
<ion-navbar *navbar>
    <ion-title>Participant</ion-title>
    <ion-buttons end>
        <button (click)="toggleFav(attendeeItem)">
            <ion-icon name="star" [hidden]="!getFav(attendeeItem)"></ion-icon>
            <ion-icon name="star-outline" [hidden]="getFav(attendeeItem)"></ion-icon>
        </button>
    </ion-buttons>
</ion-navbar>
<ion-content>
    <div padding>
        <div class="attendee-card">
            <img [src]="attendeeItem.avatar"><br>
            <h1>{{attendeeItem.name}}</h1>
            <h4 (click)="goToCompany(attendeeItem)">{{[attendeeItem.job, attendeeItem.company] | notEmpty | join:', '}}</h4>
            <a clear small twitter *ngIf="attendeeItem.twitterUrl" [href]="attendeeItem.twitterUrl" target="_blank"><ion-icon name="logo-twitter"></ion-icon></a><br>
        </div>
        <p>{{attendeeItem.description}}</p>
    </div>
    <ion-list *ngIf="attendeeFull && attendeeFull.exponents.length > 0">
        <ion-list-header>Exposants</ion-list-header>
        <exponent-item *ngFor="let exponent of attendeeFull.exponents" [exponent]="exponent" (click)="goToExponent(exponent)"></exponent-item>
    </ion-list>
    <ion-list *ngIf="attendeeFull && attendeeFull.sessions.length > 0">
        <ion-list-header>Sessions</ion-list-header>
        <session-item *ngFor="let session of attendeeFull.sessions" [session]="session" (click)="goToSession(session)"></session-item>
    </ion-list>
</ion-content>
`
})
export class AttendeePage implements OnInit {
    now: number = DateHelper.now();
    eventItem: EventItem;
    attendeeItem: AttendeeItem;
    attendeeFull: AttendeeFull;
    constructor(private _nav: NavController,
                private _navParams: NavParams,
                private _eventData: EventData) {}

    ngOnInit() {
        this.attendeeItem = <AttendeeItem> this._navParams.get('attendeeItem');
        this.eventItem = this._eventData.getCurrentEventItem();
        this._eventData.getAttendeeFromCurrent(this.attendeeItem.uuid).then(attendee => this.attendeeFull = attendee);
    }

    getFav(attendee: AttendeeItem): boolean { return this._eventData.getAttendeeFavorite(attendee); }
    toggleFav(attendee: AttendeeItem) { this._eventData.toggleAttendeeFavorite(attendee); }

    goToCompany(attendeeItem: AttendeeItem) {
        this._nav.push(AttendeeFilterPage, {
            filter: { company: attendeeItem.company }
        });
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

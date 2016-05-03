import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {NavController, NavParams} from "ionic-angular/index";
import {EventItem} from "./models/Event";
import {ExponentItem, ExponentFull} from "./models/Exponent";
import {AttendeeItem} from "./models/Attendee";
import {DateHelper} from "../common/utils/date";
import {EventData} from "./services/event.data";
import {RatingComponent} from "../common/components/rating.component";
import {NotEmptyPipe, JoinPipe} from "../common/pipes/array.pipe";
import {AttendeePage} from "./attendee.page";

@Page({
    pipes: [NotEmptyPipe, JoinPipe],
    directives: [RatingComponent],
    template: `
<ion-navbar *navbar>
    <ion-title>Exposant</ion-title>
    <ion-buttons end>
        <button (click)="toggleFav(exponentItem)">
            <ion-icon name="star" [hidden]="!getFav(exponentItem)"></ion-icon>
            <ion-icon name="star-outline" [hidden]="getFav(exponentItem)"></ion-icon>
        </button>
    </ion-buttons>
</ion-navbar>
<ion-content>
    <div padding>
        <h1>{{exponentItem.name}}</h1>
        <p *ngIf="eventItem.start < now" style="float: right; margin-top: 5px;"><rating [value]="getRating(exponentItem)" (change)="setRating(exponentItem, $event)"></rating></p>
        <p>{{exponentItem.place}}</p>
        <p style="clear: both;">{{exponentItem.description}}</p>
    </div>
    <ion-list *ngIf="exponentFull && exponentFull.team.length > 0">
        <ion-list-header>Speakers</ion-list-header>
        <ion-item *ngFor="#exponent of sessionFull.team" (click)="goToAttendee(exponent)">
            <ion-avatar item-left><img [src]="exponent.avatar"></ion-avatar>
            <h2>{{exponent.name}}</h2>
            <p>{{[attendee.job, attendee.company] | notEmpty | join:', '}}</p>
        </ion-item>
    </ion-list>
</ion-content>
`
})
export class ExponentPage implements OnInit {
    now: number = DateHelper.now();
    eventItem: EventItem;
    exponentItem: ExponentItem;
    exponentFull: ExponentFull;
    constructor(private _nav: NavController,
                private _navParams: NavParams,
                private _eventData: EventData) {}

    ngOnInit() {
        this.exponentItem = <ExponentItem> this._navParams.get('exponentItem');
        this.eventItem = this._eventData.getCurrentEventItem();
        this._eventData.getExponentFromCurrent(this.exponentItem.uuid).then(exponent => this.exponentFull = exponent);
    }

    getFav(exponent: ExponentItem): boolean { return this._eventData.getExponentFavorite(exponent); }
    toggleFav(exponent: ExponentItem) { this._eventData.toggleExponentFavorite(exponent); }
    getRating(exponent: ExponentItem): number { return this._eventData.getExponentRating(exponent); }
    setRating(exponent: ExponentItem, value: number) { this._eventData.setExponentRating(exponent, this.getRating(exponent) !== value ? value : 0); }

    goToAttendee(attendeeItem: AttendeeItem) {
        this._nav.push(AttendeePage, {
            attendeeItem: attendeeItem
        });
    }
}

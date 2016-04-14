import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {NavController, NavParams} from "ionic-angular/index";
import {ExponentItem} from "./models/ExponentItem";
import {ExponentFull} from "./models/ExponentFull";
import {AttendeeItem} from "./models/AttendeeItem";
import {EventData} from "./services/event.data";
import {AttendeePage} from "./attendee.page";

@Page({
    template: `
<ion-navbar *navbar>
    <ion-title>Exposant</ion-title>
</ion-navbar>
<ion-content class="exponent-page">
    <div padding>
        <h1>{{exponentItem.name}}</h1>
        <p>{{exponentItem.place}}</p>
        <p>{{exponentItem.description}}</p>
    </div>
    <ion-list *ngIf="exponentFull && exponentFull.team.length > 0">
        <ion-list-header>Speakers</ion-list-header>
        <ion-item *ngFor="#exponent of sessionFull.team" (click)="goToAttendee(exponent)">
            <ion-avatar item-left><img [src]="exponent.avatar"></ion-avatar>
            <h2>{{exponent.name}}</h2>
            <p>{{[attendee.job, attendee.company].filter(notEmpty).join(', ')}}</p>
        </ion-item>
    </ion-list>
</ion-content>
`
})
export class ExponentPage implements OnInit {
    exponentItem: ExponentItem;
    exponentFull: ExponentFull;
    constructor(private _nav: NavController,
                private _navParams: NavParams,
                private _eventData: EventData) {}

    ngOnInit() {
        this.exponentItem = <ExponentItem> this._navParams.get('exponentItem');
        this._eventData.getExponentFromCurrent(this.exponentItem.uuid).then(exponent => this.exponentFull = exponent);
    }

    goToAttendee(attendeeItem: AttendeeItem) {
        this._nav.push(AttendeePage, {
            attendeeItem: attendeeItem
        });
    }

    notEmpty(e: string): boolean {
        return e ? e.length > 0 : false;
    }
}

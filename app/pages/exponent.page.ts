import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {NavController, NavParams} from "ionic-angular/index";
import {ExponentItem} from "../models/ExponentItem";
import {ExponentFull} from "../models/ExponentFull";
import {AttendeeItem} from "../models/AttendeeItem";
import {EventService} from "../common/event.service";
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
            <ion-avatar item-left>
                <img src="{{exponent.avatar}}">
            </ion-avatar>
            <h2>{{exponent.name}}</h2>
            <p class="nowrap lines2">{{exponent.description}}</p>
        </ion-item>
    </ion-list>
</ion-content>
`
})
export class ExponentPage implements OnInit {
    exponentItem: ExponentItem;
    exponentFull: ExponentFull;
    constructor(private _eventService: EventService,
                private _nav: NavController,
                private _navParams: NavParams) {}

    ngOnInit() {
        this.exponentItem = <ExponentItem> this._navParams.get('exponentItem');
        this._eventService.getExponentFromCurrent(this.exponentItem.uuid).then(exponent => this.exponentFull = exponent);
    }

    goToAttendee(attendeeItem: AttendeeItem) {
        this._nav.push(AttendeePage, {
            attendeeItem: attendeeItem
        });
    }
}

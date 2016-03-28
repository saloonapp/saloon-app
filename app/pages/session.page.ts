import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {NavController, NavParams} from "ionic-angular/index";
import {Session} from "../models/Session";
import {Attendee} from "../models/Attendee";
import {WeekDayPipe, TimePipe} from "../common/pipes/datetime.pipe";
import {CapitalizePipe} from "../common/pipes/text.pipe";
import {AttendeePage} from "./attendee.page";

@Page({
    template: `
<ion-navbar *navbar>
    <ion-title>Session</ion-title>
</ion-navbar>
<ion-content class="session-page">
    <div padding>
        <h1>{{session.name}}</h1>
        <p>{{session.start | weekDay | capitalize}}, {{session.start | time}}-{{session.end | time}}</p>
        <p>{{session.place}}</p>
        <p>{{session.description}}</p>
    </div>
    <ion-list *ngIf="session.speakers.length > 0">
        <ion-list-header>Speakers</ion-list-header>
        <ion-item *ngFor="#speaker of session.speakers" (click)="navigateTo(speaker)">
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
    session: Session;
    constructor(private _nav: NavController, private _navParams: NavParams) {}

    ngOnInit() {
        this.session = <Session> this._navParams.get('session');
    }

    navigateTo(attendee: Attendee) {
        this._nav.push(AttendeePage, {
            attendee: attendee
        });
    }
}

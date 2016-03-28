import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {NavController, NavParams} from "ionic-angular/index";
import {Session} from "../models/Session";
import {EventService} from "../common/event.service";
import {WeekDayPipe, TimePipe} from "../common/pipes/datetime.pipe";

@Page({
    template: `
<ion-navbar *navbar>
    <ion-title>Session</ion-title>
</ion-navbar>
<ion-content class="session-page">
    <div padding>
        <h1>{{session.name}}</h1>
        <p>{{session.start | weekDay}}, {{session.start | time}}-{{session.end | time}}</p>
        <p>{{session.place}}</p>
        <p>{{session.description}}</p>
    </div>
    <ion-list>
        <ion-list-header>Speakers</ion-list-header>
        <ion-item *ngFor="#speaker of session.speakers">
            <ion-avatar item-left>
                <img src="{{speaker.avatar}}">
            </ion-avatar>
            <h2>{{speaker.name}}</h2>
            <p class="nowrap lines2">{{speaker.description}}</p>
        </ion-item>
    </ion-list>
</ion-content>
`,
    pipes: [WeekDayPipe, TimePipe]
})
export class SessionPage implements OnInit {
    session: Session;
    constructor(private _nav: NavController, private _navParams: NavParams) {}

    ngOnInit() {
        this.session = <Session> this._navParams.get('session');
    }
}

import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {NavParams, Alert} from "ionic-angular/index";
import {EventItem} from "../models/EventItem";
import {EventFull} from "../models/EventFull";
import {EventService} from "../common/event.service";
import {TimePipe} from "../common/pipes/datetime.pipe";
import {NavController} from "ionic-angular/index";


@Page({
    styles: [`
.item h2 {
    white-space: initial;
}
    `],
    template: `
<ion-navbar *navbar>
    <ion-title>{{eventItem.name}}</ion-title>
</ion-navbar>
<ion-content class="event-page">
    <ion-refresher (refresh)="doRefresh($event)"></ion-refresher>
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list *ngIf="eventFull">
        <ion-item *ngFor="#session of eventFull.sessions">
            <h2>{{session.name}}</h2>
            <p>{{session.start | time}}-{{session.end | time}} {{session.place}} {{session.category}}</p>
            <p><span *ngFor="#p of session.speakers" class="label">{{p.name}} </span></p>
        </ion-item>
    </ion-list>
</ion-content>
`,
    pipes: [TimePipe]
})
export class EventPage implements OnInit {
    eventItem: EventItem;
    eventFull: EventFull;
    constructor(private _eventService: EventService, private _nav: NavController, private _navParams: NavParams) {}

    ngOnInit() {
        this.eventItem = <EventItem> this._navParams.get('event');
        this._eventService.getEvent(this.eventItem.uuid).then(eventFull => {
            this.eventFull = eventFull;
        });
    }

    doRefresh(refresher) {
        this._eventService.fetchEvent(this.eventItem.uuid).then(eventFull => {
            this.eventFull = eventFull;
            refresher.complete();
        }, error => {
            console.log('error', error);
            let alert = Alert.create({
                title: 'Fail to update :(',
                subTitle: 'Your friend, Obi wan Kenobi, just accepted your friend request!',
                buttons: ['Ok']
            });
            this._nav.present(alert);
            refresher.complete();
        });
    }
}

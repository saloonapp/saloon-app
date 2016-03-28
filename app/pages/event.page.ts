import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {EventItem} from "../models/EventItem";
import {EventFull} from "../models/EventFull";
import {EventService} from "../common/event.service";
import {NavParams} from "ionic-angular/index";


@Page({
    template: `
<ion-navbar *navbar>
    <ion-title>{{eventItem.name}}</ion-title>
</ion-navbar>
<ion-content class="event-page">
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list *ngIf="eventFull">
        <ion-item *ngFor="#session of eventFull.sessions">
            {{session.name}}
        </ion-item>
    </ion-list>
</ion-content>
`
})
export class EventPage implements OnInit {
    eventItem: EventItem;
    eventFull: EventFull;
    constructor(private _eventService: EventService, private _navParams: NavParams) {}

    ngOnInit() {
        this.eventItem = <EventItem> this._navParams.get('event');
        this._eventService.getEvent(this.eventItem.uuid).then(eventFull => {
            this.eventFull = eventFull;
        });
    }
}

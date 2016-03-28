import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {EventFull} from "../models/EventFull";
import {EventService} from "../common/event.service";
import {NavParams} from "ionic-angular/index";


@Page({
    template: `
<ion-navbar *navbar>
    <ion-title>Événement</ion-title>
</ion-navbar>
<ion-content class="event-page">
    <div *ngIf="event">
        {{event.name}}
    </div>
</ion-content>
`
})
export class EventPage implements OnInit {
    event: EventFull;
    constructor(private _eventService: EventService, private _navParams: NavParams) {}

    ngOnInit() {
        this.event = <EventFull> this._navParams.get('event');
    }
}

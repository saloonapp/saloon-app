import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {EventItem} from "../models/EventItem";
import {EventService} from "../common/event.service";
import {EventItemComponent} from "../components/event-item.component";
import {NavController} from "ionic-angular/index";
import {EventPage} from "./event.page";

@Page({
    template: `
<ion-navbar *navbar>
    <ion-title>Événements</ion-title>
</ion-navbar>
<ion-content class="event-list-page">
    <event-item *ngFor="#event of events" [event]="event" (click)="navigateTo(event)"></event-item>
    <!--<ion-list>
        <ion-item *ngFor="#event of events" (click)="navigateTo(event)">
            <ion-thumbnail item-left>
                <img src="{{event.logoUrl}}">
            </ion-thumbnail>
            <h2>{{event.name}}</h2>
            <h3>{{event.start | date}}, {{event.address.city}}</h3>
            <p>{{event.description}}</p>
        </ion-item>
    </ion-list>-->
    <p padding>
        Si votre événement n'est pas référencé ici, nous pouvons l'ajouter.
        Pour ça, il vous suffit de nous le signaler.
    </p>
</ion-content>
`,
    directives: [EventItemComponent]
})
export class EventListPage implements OnInit {
    events: EventItem[];
    constructor(private _eventService: EventService, private _nav: NavController) {}

    ngOnInit() {
        this._eventService.getEvents().then(events => this.events = events);
    }

    navigateTo(event: EventItem) {
        this._eventService.getEvent(event.uuid).then(eventFull => {
            this._nav.push(EventPage, {
                event: eventFull
            });
        });
    }
}

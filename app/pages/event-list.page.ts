import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {NavController, Alert} from "ionic-angular/index";
import {EventItem} from "../models/EventItem";
import {Storage} from "../common/storage.service";
import {EventService} from "../common/event.service";
import {EventItemComponent} from "../components/event-item.component";
import {EventPage} from "./event.page";

@Page({
    template: `
<ion-navbar *navbar>
    <ion-title>Événements</ion-title>
    <ion-buttons end>
        <button (click)="clearStorage()">
            <ion-icon ios="ios-trash-outline" md="md-trash-b"></ion-icon>
        </button>
    </ion-buttons>
</ion-navbar>
<ion-content class="event-list-page">
    <ion-refresher (refresh)="doRefresh($event)"></ion-refresher>
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
    constructor(private _storage: Storage, private _eventService: EventService, private _nav: NavController) {}

    ngOnInit() {
        this._eventService.getEvents().then(events => this.events = events);
    }

    doRefresh(refresher) {
        this._eventService.fetchEvents().then(events => {
            this.events = events;
            refresher.complete();
        });
    }

    navigateTo(event: EventItem) {
        this._nav.push(EventPage, {
            event: event
        });
    }

    clearStorage() {
        let alert = Alert.create({
            title: 'Delete storage ?',
            buttons: [
                {
                    text: 'No',
                    handler: () => {}
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this._storage.clear()
                    }
                }
            ]
        });
        this._nav.present(alert);
    }
}

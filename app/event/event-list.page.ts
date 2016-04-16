import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {NavController, Alert} from "ionic-angular/index";
import {EventItem} from "./models/EventItem";
import {DatePeriodPipe} from "../common/pipes/datetime.pipe";
import {EventItemComponent} from "./components/event-item.component";
import {Storage} from "../common/storage.service";
import {EventService} from "./services/event.service";
import {UiUtils} from "../common/ui/utils";
import {EventPage} from "./event.page.ts";

@Page({
    directives: [EventItemComponent],
    pipes: [DatePeriodPipe],
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
    <ion-refresher (refresh)="doRefresh($event)"><ion-refresher-content></ion-refresher-content></ion-refresher>
    <event-item *ngFor="#event of events" [event]="event" (click)="goToEvent(event)"></event-item>
    <!--<ion-list>
        <ion-item *ngFor="#event of events" (click)="goToEvent(event)">
            <ion-thumbnail item-left><img [src]="event.logoUrl"></ion-thumbnail>
            <h2>{{event.name}}</h2>
            <h3>{{event.start | datePeriod:event.end}}, {{event.address.city}}</h3>
            <p>{{event.description}}</p>
        </ion-item>
    </ion-list>-->
    <p padding>
        Si votre événement n'est pas référencé ici, nous pouvons l'ajouter.
        Pour ça, il vous suffit de nous le signaler.
    </p>
</ion-content>
`
})
export class EventListPage implements OnInit {
    events: EventItem[];
    constructor(private _nav: NavController,
                private _storage: Storage,
                private _eventService: EventService,
                private _uiUtils: UiUtils) {}

    // TODO http://ionicframework.com/docs/v2/api/components/virtual-scroll/VirtualScroll/
    ngOnInit() {
        this._eventService.getEvents().then(
            events => this.events = events,
            error => this._uiUtils.alert(this._nav, 'Fail to update :(')
        );
    }

    doRefresh(refresher) {
        this._eventService.fetchEvents().then(
            events => {
                this.events = events;
                refresher.complete();
            },
            error => {
                this._uiUtils.alert(this._nav, 'Fail to update :(');
                refresher.complete();
            }
        );
    }

    goToEvent(eventItem: EventItem) {
        this._nav.push(EventPage, {
            eventItem: eventItem
        });
    }

    clearStorage() {
        this._uiUtils.confirm(this._nav, 'Delete storage ?').then(() => {
            this._storage.clear();
            console.log('Storage deleted !');
        });
    }
}

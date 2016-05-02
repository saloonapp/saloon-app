import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {NavController} from "ionic-angular/index";
import {EventItem} from "./models/Event";
import {EventItemComponent} from "./components/event-item.component";
import {EventService} from "./services/event.service";
import {UiHelper} from "../common/ui/utils";
import {EventPage} from "./event.page.ts";

@Page({
    directives: [EventItemComponent],
    template: `
<ion-navbar *navbar>
    <ion-title>Événements</ion-title>
</ion-navbar>
<ion-content class="event-list-page">
    <ion-refresher (refresh)="doRefresh($event)"><ion-refresher-content></ion-refresher-content></ion-refresher>
    <event-item *ngFor="#event of events" [event]="event" (click)="goToEvent(event)"></event-item>
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
                private _eventService: EventService,
                private _uiHelper: UiHelper) {}

    // TODO http://ionicframework.com/docs/v2/api/components/virtual-scroll/VirtualScroll/
    ngOnInit() {
        this._eventService.getEvents().then(
            events => this.events = events,
            error => this._uiHelper.alert(this._nav, 'Fail to update :(')
        );
    }

    doRefresh(refresher) {
        this._eventService.fetchEvents().then(
            events => {
                this.events = events;
                refresher.complete();
            },
            error => {
                this._uiHelper.alert(this._nav, 'Fail to update :(');
                refresher.complete();
            }
        );
    }

    goToEvent(eventItem: EventItem) {
        this._uiHelper.showLoading(this._nav);
        this._nav.push(EventPage, {
            eventItem: eventItem
        });
    }
}

import {Page} from 'ionic-angular';
import {NavController} from "ionic-angular/index";
import {EventFull} from "../models/EventFull";
import {EventItem} from "../models/EventItem";
import {AttendeeFull} from "../models/AttendeeFull";
import {EventService} from "../common/event.service";
import {Filter} from "../common/utils/array";
import {UiUtils} from "../common/ui/utils";
import {AttendeePage} from "./attendee.page";

@Page({
    template: `
<ion-navbar *navbar>
  <ion-title>Attendee list</ion-title>
</ion-navbar>
<ion-content class="attendee-list-page">
    <ion-refresher (refresh)="doRefresh($event)"></ion-refresher>
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-searchbar [(ngModel)]="searchQuery" (input)="search()" debounce="500"></ion-searchbar>
    <ion-list *ngIf="filtered.length > 0">
        <ion-item *ngFor="#attendee of filtered" (click)="goToAttendee(attendee)">
            <h2>{{attendee.name}}</h2>
        </ion-item>
    </ion-list>
</ion-content>
`,
})
export class AttendeeListPage {
    searchQuery: string = '';
    eventItem: EventItem;
    eventFull: EventFull;
    filtered: AttendeeFull[] = [];
    constructor(private _eventService: EventService,
                private _nav: NavController,
                private _uiUtils: UiUtils) {}

    ngOnInit() {
        this.eventItem = this._eventService.getCurrentEventItem();
        this._eventService.getCurrentEventFull().then(event => {
            this.eventFull = event;
            this.filtered = this.filter(this.eventFull.attendees, this.searchQuery);
        });
    }

    doRefresh(refresher) {
        this._eventService.fetchEvent(this.eventItem.uuid).then(
            eventFull => {
                this.eventItem = EventFull.toItem(eventFull);
                this.eventFull = eventFull;
                this.filtered = this.filter(this.eventFull.attendees, this.searchQuery);
                this._eventService.updateCurrentEvent(this.eventItem, this.eventFull);
                refresher.complete();
            },
            error => {
                this._uiUtils.alert(this._nav, 'Fail to update :(');
                refresher.complete();
            }
        );
    }

    search() {
        this.filtered = this.filter(this.eventFull.attendees, this.searchQuery);
    }

    filter(items: AttendeeFull[], q: string): AttendeeFull[] {
        if(q.trim() === ''){ return items; } // don't filter if query is empty
        return items.filter(session => Filter.deep(session, q));
    }

    goToAttendee(attendeeFull: AttendeeFull) {
        this._nav.push(AttendeePage, {
            attendeeItem: AttendeeFull.toItem(attendeeFull)
        });
    }
}

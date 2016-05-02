import {Page} from 'ionic-angular';
import {NavController} from "ionic-angular/index";
import {EventItem, EventFull} from "./models/Event";
import {AttendeeFull} from "./models/Attendee";
import {SessionItem} from "./models/Session";
import {ExponentItem} from "./models/Exponent";
import {EventData} from "./services/event.data";
import {ArrayHelper, ItemGroup, Filter, Sort} from "../common/utils/array";
import {UiHelper} from "../common/ui/utils";
import {TwitterHandlePipe} from "../common/pipes/social.pipe";
import {NotEmptyPipe, JoinPipe} from "../common/pipes/array.pipe";
import {AttendeePage} from "./attendee.page";
import {SessionPage} from "./session.page";
import {ExponentPage} from "./exponent.page";

@Page({
    pipes: [TwitterHandlePipe, NotEmptyPipe, JoinPipe],
    template: `
<ion-navbar *navbar>
    <button menuToggle><ion-icon name="menu"></ion-icon></button>
    <ion-title>Participants</ion-title>
</ion-navbar>
<ion-toolbar>
    <ion-searchbar [(ngModel)]="searchQuery" (input)="search()" debounce="500"></ion-searchbar>
</ion-toolbar>
<ion-content class="attendee-list-page">
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list-header *ngIf="eventFull && filtered.length === 0">Pas de participant trouvé</ion-list-header>
    <ion-list *ngIf="eventFull && filtered.length > 0" [virtualScroll]="filtered" [headerFn]="virtualHeader">
        <ion-item-divider *virtualHeader="#letter" sticky>{{letter}}</ion-item-divider>
        <ion-item *virtualItem="#attendee" (click)="goToAttendee(attendee)">
            <ion-avatar item-left><ion-img [src]="attendee.avatar"></ion-img></ion-avatar>
            <h2>{{attendee.name}}</h2>
            <p>{{[attendee.job, attendee.company] | notEmpty | join:', '}}</p>
            <button clear item-right (click)="toggleFav(attendee);$event.stopPropagation();">
                <ion-icon name="star" [hidden]="!isFav(attendee)"></ion-icon>
                <ion-icon name="star-outline" [hidden]="isFav(attendee)"></ion-icon>
            </button>
        </ion-item>
    </ion-list>
</ion-content>
`
})
export class AttendeeListPage {
    eventItem: EventItem;
    eventFull: EventFull;
    searchQuery: string = '';
    filtered: AttendeeFull[] = [];
    constructor(private _nav: NavController,
                private _eventData: EventData,
                private _uiHelper: UiHelper) {}

    ngOnInit() {
        this.eventItem = this._eventData.getCurrentEventItem();
        this._eventData.getCurrentEventFull().then(event => {
            this.eventFull = event;
            this.filtered = Filter.deep(this.eventFull.attendees, this.searchQuery);
            this._uiHelper.hideLoading();
        });
    }

    search() {
        this.filtered = Filter.deep(this.eventFull.attendees, this.searchQuery);
    }

    virtualHeader(item, index, array) {
        if(index === 0 || item.lastName[0].toUpperCase() !== array[index-1].lastName[0].toUpperCase()) {
            return item.lastName[0].toUpperCase();
        }
        return null;
    }

    isFav(attendee: AttendeeFull): boolean {
        return this._eventData.isFavoriteAttendee(attendee);
    }

    toggleFav(attendee: AttendeeFull) {
        this._eventData.toggleFavoriteAttendee(attendee);
    }

    goToAttendee(attendeeFull: AttendeeFull) {
        this._nav.push(AttendeePage, {
            attendeeItem: attendeeFull.toItem()
        });
    }
    goToExponent(exponentItem: ExponentItem) {
        this._nav.push(ExponentPage, {
            exponentItem: exponentItem
        });
    }
    goToSession(sessionItem: SessionItem) {
        this._nav.push(SessionPage, {
            sessionItem: sessionItem
        });
    }
}

import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {NavController} from "ionic-angular/index";
import {EventItem, EventFull} from "./models/Event";
import {AttendeeFull} from "./models/Attendee";
import {EventData} from "./services/event.data";
import {Filter} from "../common/utils/array";
import {UiHelper} from "../common/ui/utils";
import {AttendeeItemComponent} from "./components/attendee-item.component";
import {NotEmptyPipe, JoinPipe} from "../common/pipes/array.pipe";
import {AttendeePage} from "./attendee.page";

@Page({
    pipes: [NotEmptyPipe, JoinPipe],
    directives: [AttendeeItemComponent],
    template: `
<ion-navbar *navbar>
    <button menuToggle><ion-icon name="menu"></ion-icon></button>
    <ion-title>Participants</ion-title>
</ion-navbar>
<ion-toolbar>
    <ion-searchbar [(ngModel)]="searchQuery" (input)="search()" debounce="500"></ion-searchbar>
</ion-toolbar>
<ion-content>
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list-header *ngIf="eventFull && filtered.length === 0">Pas de participant trouvé</ion-list-header>
    <ion-list *ngIf="eventFull && filtered.length > 0" [virtualScroll]="filtered" [headerFn]="virtualHeader">
        <ion-item-divider *virtualHeader="#letter" sticky>{{letter}}</ion-item-divider>
        <!--TODO : do not work.... :( <attendee-item *virtualItem="#attendee" [attendee]="attendee" (click)="goToAttendee(attendee)"></attendee-item>-->
        <ion-item *virtualItem="#attendee" (click)="goToAttendee(attendee)">
            <ion-avatar item-left><ion-img [src]="attendee.avatar"></ion-img></ion-avatar>
            <h2>{{attendee.name}}</h2>
            <p>{{[attendee.job, attendee.company] | notEmpty | join:', '}}</p>
            <button clear item-right (click)="toggleFav(attendee);$event.stopPropagation();">
                <ion-icon name="star" [hidden]="!getFav(attendee)"></ion-icon>
                <ion-icon name="star-outline" [hidden]="getFav(attendee)"></ion-icon>
            </button>
        </ion-item>
    </ion-list>
</ion-content>
`
})
export class AttendeeListPage implements OnInit {
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
            // TODO : should watch 'this.eventFull' changes to update 'this.filtered' (updated only after restert right now...)
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

    getFav(attendee: AttendeeFull): boolean { return this._eventData.getAttendeeFavorite(attendee); }
    toggleFav(attendee: AttendeeFull) { this._eventData.toggleAttendeeFavorite(attendee); }

    goToAttendee(attendeeFull: AttendeeFull) {
        this._nav.push(AttendeePage, {
            attendeeItem: attendeeFull.toItem()
        });
    }
}

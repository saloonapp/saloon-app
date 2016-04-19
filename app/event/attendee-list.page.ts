import {Page} from 'ionic-angular';
import {NavController} from "ionic-angular/index";
import {EventItem} from "./models/EventItem";
import {EventFull} from "./models/EventFull";
import {AttendeeFull} from "./models/AttendeeFull";
import {SessionItem} from "./models/SessionItem";
import {ExponentItem} from "./models/ExponentItem";
import {EventData} from "./services/event.data";
import {ArrayHelper, ItemGroup, Filter, Sort} from "../common/utils/array";
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
    <ion-list *ngIf="eventFull && filtered.length > 0">
        <ion-item-group *ngFor="#group of filtered">
            <ion-item-divider sticky>{{group.key}}</ion-item-divider>
            <ion-item *ngFor="#attendee of group.values" (click)="goToAttendee(attendee)">
                <ion-avatar item-left><img [src]="attendee.avatar"></ion-avatar>
                <h2>{{attendee.name}}</h2>
                <p>{{[attendee.job, attendee.company] | notEmpty | join:', '}}</p>
                <button clear item-right (click)="toggleFav(attendee);$event.stopPropagation();">
                    <ion-icon name="star" [hidden]="!isFav(attendee)"></ion-icon>
                    <ion-icon name="star-outline" [hidden]="isFav(attendee)"></ion-icon>
                </button>
            </ion-item>
        </ion-item-group>
    </ion-list>
</ion-content>
`
})
export class AttendeeListPage {
    searchQuery: string = '';
    eventItem: EventItem;
    eventFull: EventFull;
    filtered: ItemGroup<AttendeeFull>[] = [];
    constructor(private _nav: NavController,
                private _eventData: EventData) {}

    // TODO http://ionicframework.com/docs/v2/api/components/virtual-scroll/VirtualScroll/
    ngOnInit() {
        this.eventItem = this._eventData.getCurrentEventItem();
        setTimeout(() => {
            this._eventData.getCurrentEventFull().then(event => {
                this.eventFull = event;
                this.filtered = AttendeeListHelper.compute(this.eventFull.attendees, this.searchQuery);
            });
        }, 600);
    }

    search() {
        this.filtered = AttendeeListHelper.compute(this.eventFull.attendees, this.searchQuery);
    }

    isFav(attendee: AttendeeFull): boolean {
        return this._eventData.isFavoriteAttendee(attendee);
    }

    toggleFav(attendee: AttendeeFull) {
        this._eventData.toggleFavoriteAttendee(attendee);
    }

    goToAttendee(attendeeFull: AttendeeFull) {
        this._nav.push(AttendeePage, {
            attendeeItem: AttendeeFull.toItem(attendeeFull)
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

class AttendeeListHelper {
    public static compute(items: AttendeeFull[], q: string): ItemGroup<AttendeeFull>[] {
        const filtered: AttendeeFull[] = Filter.deep(items, q);
        const grouped: ItemGroup<AttendeeFull>[] = ArrayHelper.groupBy(filtered, i => i.lastName[0].toUpperCase());
        return grouped.sort((e1, e2) => Sort.str(e1.key, e2.key));
    }
}

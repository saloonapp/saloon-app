import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {NavController} from "ionic-angular/index";
import {EventItem, EventFull} from "./models/Event";
import {SessionFull} from "./models/Session";
import {EventData} from "./services/event.data";
import {Filter} from "../common/utils/array";
import {DateHelper} from "../common/utils/date";
import {DOMHelper} from "../common/utils/DOM";
import {UiHelper} from "../common/ui/utils";
import {RatingComponent} from "../common/components/rating.component";
import {SessionItemComponent} from "./components/session-item.component";
import {WeekDayPipe, TimePipe, TimePeriodPipe} from "../common/pipes/datetime.pipe";
import {CapitalizePipe} from "../common/pipes/text.pipe";
import {MapPipe, NotEmptyPipe, JoinPipe} from "../common/pipes/array.pipe";
import {SessionPage} from "./session.page";

@Page({
    pipes: [WeekDayPipe, TimePipe, TimePeriodPipe, CapitalizePipe, MapPipe, NotEmptyPipe, JoinPipe],
    directives: [RatingComponent, SessionItemComponent],
    styles: [`
.item h2, .item p {
    white-space: initial;
}
    `],
    template: `
<ion-navbar *navbar>
    <button menuToggle><ion-icon name="menu"></ion-icon></button>
    <ion-title>{{eventItem.name}}</ion-title>
    <!--<ion-buttons end>
        <button (click)="scrollToNow()" [hidden]="!isNow(eventItem)"><ion-icon name="arrow-round-down"></ion-icon></button>
    </ion-buttons>-->
</ion-navbar>
<ion-toolbar>
    <ion-searchbar [(ngModel)]="searchQuery" (input)="search()" debounce="500"></ion-searchbar>
</ion-toolbar>
<ion-content>
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list-header *ngIf="eventFull && filtered.length === 0">Pas de session trouvée</ion-list-header>
    <ion-list *ngIf="eventFull && filtered.length > 0" [virtualScroll]="filtered" [headerFn]="virtualHeader">
        <ion-item-divider *virtualHeader="#session" class="start-{{session.start}}" sticky>
            {{session.start | weekDay | capitalize}}, {{session.start | time}}
        </ion-item-divider>
        <!--TODO : do not work.... :( <session-item *virtualItem="#session" [session]="session" (click)="goToSession(session)"></session-item>-->
        <ion-item *virtualItem="#session" (click)="goToSession(session)">
            <h2>{{session.name}} <rating *ngIf="getRating(session) > 0" [value]="getRating(session)"></rating></h2>
            <p>{{[session.place, session.category, session.start | timePeriod:session.end] | notEmpty | join:' - '}}</p>
            <p>{{session.speakers | map:'name' | join:', '}}</p>
            <button clear item-right (click)="toggleFav(session);$event.stopPropagation();">
                <ion-icon name="star" [hidden]="!getFav(session)"></ion-icon>
                <ion-icon name="star-outline" [hidden]="getFav(session)"></ion-icon>
            </button>
        </ion-item>
    </ion-list>
</ion-content>
`
})
// TODO : filter sessions by : only favorites, day, track, room, last updated
export class SessionListPage implements OnInit {
    eventItem: EventItem;
    eventFull: EventFull;
    searchQuery: string = '';
    filtered: SessionFull[] = [];
    constructor(private _nav: NavController,
                private _eventData: EventData,
                private _uiHelper: UiHelper) {}

    ngOnInit() {
        this.eventItem = this._eventData.getCurrentEventItem();
        this._eventData.getCurrentEventFull().then(event => {
            this.eventFull = event;
            // TODO : should watch this.eventFull changes to update this.filtered (updated after restert right now...)
            this.filtered = Filter.deep(this.eventFull.sessions, this.searchQuery);
            this._uiHelper.hideLoading();
        });
    }

    search() {
        this.filtered = Filter.deep(this.eventFull.sessions, this.searchQuery);
    }

    virtualHeader(item, index, array) {
        if(index === 0 || item.start !== array[index-1].start) {
            return item;
        }
        return null;
    }

    getFav(session: SessionFull): boolean { return this._eventData.getSessionFavorite(session); }
    toggleFav(session: SessionFull) { this._eventData.toggleSessionFavorite(session); }
    getRating(session: SessionFull): number { return this._eventData.getSessionRating(session); }

    // can't scrollToNow with virtual scroll :(
    /*isNow(event: EventItem): boolean {
        const now = DateHelper.now();
        return event.start && event.end && event.start < now && now < event.end;
    }

    scrollToNow() {
        const now = DateHelper.now();
        const firstNotStarted = this.filtered.find(g => parseInt(g.key) > now);
        const nowElts = firstNotStarted ? document.getElementsByClassName('start-'+firstNotStarted.key) : [];
        DOMHelper.scrollTo(nowElts.length === 1 ? nowElts[0] : null, -(56+69+56));
    }*/

    goToSession(sessionFull: SessionFull) {
        this._nav.push(SessionPage, {
            sessionItem: sessionFull.toItem()
        });
    }
}

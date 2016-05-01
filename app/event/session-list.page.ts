import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {NavController} from "ionic-angular/index";
import {EventItem} from "./models/EventItem";
import {EventFull} from "./models/EventFull";
import {SessionFull} from "./models/SessionFull";
import {EventData} from "./services/event.data";
import {ArrayHelper, ItemGroup, Filter, Sort} from "../common/utils/array";
import {DateHelper} from "../common/utils/date";
import {DOMHelper} from "../common/utils/DOM";
import {UiHelper} from "../common/ui/utils";
import {WeekDayPipe, TimePipe, TimePeriodPipe} from "../common/pipes/datetime.pipe";
import {CapitalizePipe} from "../common/pipes/text.pipe";
import {MapPipe, NotEmptyPipe, JoinPipe} from "../common/pipes/array.pipe";
import {SessionPage} from "./session.page";

@Page({
    pipes: [WeekDayPipe, TimePipe, TimePeriodPipe, CapitalizePipe, MapPipe, NotEmptyPipe, JoinPipe],
    styles: [`
.item h2, .item p {
    white-space: initial;
}
    `],
    template: `
<ion-navbar *navbar>
    <button menuToggle><ion-icon name="menu"></ion-icon></button>
    <ion-title>{{eventItem.name}}</ion-title>
    <ion-buttons end>
        <button (click)="scrollToNow()" [hidden]="!isNow(eventItem)"><ion-icon name="arrow-round-down"></ion-icon></button>
    </ion-buttons>
</ion-navbar>
<ion-toolbar>
    <ion-searchbar [(ngModel)]="searchQuery" (input)="search()" debounce="500"></ion-searchbar>
</ion-toolbar>
<ion-content id="session-list" class="session-list-page">
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list-header *ngIf="eventFull && filtered.length === 0">Pas de session trouvée</ion-list-header>
    <ion-list *ngIf="eventFull && filtered.length > 0">
        <ion-item-group *ngFor="#group of filtered" class="start-{{group.key}}">
            <ion-item-divider sticky>{{group.key | weekDay | capitalize}}, {{group.key | time}}</ion-item-divider>
            <ion-item *ngFor="#session of group.values" (click)="goToSession(session)">
                <h2>{{session.name}}</h2>
                <p>{{[session.place, session.category, session.start | timePeriod:session.end] | notEmpty | join:' - '}}</p>
                <p>{{session.speakers | map:'name' | join:', '}}</p>
                <button clear item-right (click)="toggleFav(session);$event.stopPropagation();">
                    <ion-icon name="star" [hidden]="!isFav(session)"></ion-icon>
                    <ion-icon name="star-outline" [hidden]="isFav(session)"></ion-icon>
                </button>
            </ion-item>
        </ion-item-group>
    </ion-list>
</ion-content>
`
})
// TODO
//  filter sessions by : only favorites, day, track, room, last updated
export class SessionListPage implements OnInit {
    searchQuery: string = '';
    eventItem: EventItem;
    eventFull: EventFull;
    filtered: ItemGroup<SessionFull>[] = [];
    constructor(private _nav: NavController,
                private _eventData: EventData,
                private _uiHelper: UiHelper) {}

    // TODO http://ionicframework.com/docs/v2/api/components/virtual-scroll/VirtualScroll/
    // implement VirtualScroll with SearchPipe to improve perf & avoid compute.group()
    ngOnInit() {
        this.eventItem = this._eventData.getCurrentEventItem();
        this._eventData.getCurrentEventFull().then(event => {
            this.eventFull = event;
            this.filtered = SessionListHelper.compute(this.eventFull.sessions, this.searchQuery);
            this._uiHelper.hideLoading();
        });
    }

    search() {
        this.filtered = SessionListHelper.compute(this.eventFull.sessions, this.searchQuery);
    }

    isNow(event: EventItem): boolean {
        const now = DateHelper.now();
        return event.start && event.end && event.start < now && now < event.end;
    }

    isFav(session: SessionFull): boolean {
        return this._eventData.isFavoriteSession(session);
    }

    toggleFav(session: SessionFull) {
        this._eventData.toggleFavoriteSession(session);
    }

    scrollToNow() {
        const now = DateHelper.now();
        const firstNotStarted = this.filtered.find(g => parseInt(g.key) > now);
        const nowElts = firstNotStarted ? document.getElementsByClassName('start-'+firstNotStarted.key) : [];
        DOMHelper.scrollTo(nowElts.length === 1 ? nowElts[0] : null, -(56+69+56));
    }

    goToSession(sessionFull: SessionFull) {
        this._nav.push(SessionPage, {
            sessionItem: SessionFull.toItem(sessionFull)
        });
    }
}

class SessionListHelper {
    public static compute(items: SessionFull[], q: string): ItemGroup<SessionFull>[] {
        const filtered: SessionFull[] = Filter.deep(items, q);
        const grouped: ItemGroup<SessionFull>[] = ArrayHelper.groupBy(filtered, 'start');
        return grouped.sort((e1, e2) => Sort.num(parseInt(e1.key), parseInt(e2.key)));
    }
}

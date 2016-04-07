import {Page} from 'ionic-angular';
import {NavController} from "ionic-angular/index";
import {EventFull} from "./models/EventFull";
import {EventItem} from "./models/EventItem";
import {AttendeeFull} from "./models/AttendeeFull";
import {SessionItem} from "./models/SessionItem";
import {ExponentItem} from "./models/ExponentItem";
import {EventService} from "./services/event.service";
import {EventData} from "./services/event.data";
import {Filter, Sort} from "../common/utils/array";
import {UiUtils} from "../common/ui/utils";
import {TwitterHandlePipe} from "../common/pipes/social.pipe";
import {AttendeePage} from "./attendee.page";
import {SessionPage} from "./session.page";
import {ExponentPage} from "./exponent.page";

@Page({
    template: `
<ion-navbar *navbar>
  <ion-title>Participants</ion-title>
</ion-navbar>
<ion-toolbar>
    <ion-searchbar [(ngModel)]="searchQuery" (input)="search()" debounce="500"></ion-searchbar>
</ion-toolbar>
<ion-content class="attendee-list-page">
    <ion-refresher (refresh)="doRefresh($event)"></ion-refresher>
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list-header *ngIf="eventFull && filtered.length === 0">Pas de participant trouvé</ion-list-header>
    <ion-list *ngIf="eventFull && filtered.length > 0">
        <ion-item-group *ngFor="#group of filtered">
            <ion-item-divider sticky>{{group.title}}</ion-item-divider>
            <ion-item *ngFor="#attendee of group.items" (click)="goToAttendee(attendee)">
                <ion-avatar item-left><img [src]="attendee.avatar"></ion-avatar>
                <h2>{{attendee.name}}</h2>
                <p>{{(attendee.job ? attendee.job+', ' : '')+attendee.company}}</p>
            </ion-item>
        </ion-item-group>
    </ion-list>
    <!--<div *ngIf="eventFull && filtered.length > 0">
        <div *ngFor="#group of filtered">
            <ion-card *ngFor="#attendee of group.items">
                <ion-item (click)="goToAttendee(attendee)">
                    <ion-avatar item-left><img [src]="attendee.avatar"></ion-avatar>
                    <h2>{{attendee.name}}</h2>
                    <p>{{(attendee.job ? attendee.job+', ' : '')+attendee.company}}</p>
                </ion-item>
                <ion-list *ngIf="attendee.exponents.length > 0 || attendee.sessions.length > 0">
                    <button ion-item *ngFor="#exponent of attendee.exponents" (click)="goToExponent(exponent)">
                        <h3>{{exponent.name}}</h3>
                    </button>
                    <button ion-item *ngFor="#session of attendee.sessions" (click)="goToSession(session)">
                        <h3>{{session.name}}</h3>
                    </button>
                </ion-list>
                <ion-item *ngIf="attendee.twitterUrl">
                    <button primary clear item-left>
                        <ion-icon name="logo-twitter"></ion-icon>
                        <a href="{{attendee.twitterUrl}}">{{attendee.twitterUrl | twitterHandle}}</a>
                    </button>
                </ion-item>
            </ion-card>
        </div>
    </div>-->
</ion-content>
`,
    pipes: [TwitterHandlePipe]
})
export class AttendeeListPage {
    searchQuery: string = '';
    eventItem: EventItem;
    eventFull: EventFull;
    filtered: Array<any> = [];
    constructor(private _nav: NavController,
                private _eventService: EventService,
                private _eventData: EventData,
                private _uiUtils: UiUtils) {}

    ngOnInit() {
        this.eventItem = this._eventData.getCurrentEventItem();
        setTimeout(() => {
            this._eventData.getCurrentEventFull().then(event => {
                this.eventFull = event;
                this.filtered = this.compute(this.eventFull.attendees, this.searchQuery);
            });
        }, 600);
    }

    doRefresh(refresher) {
        this._eventService.fetchEvent(this.eventItem.uuid).then(
            eventFull => {
                this.eventItem = EventFull.toItem(eventFull);
                this.eventFull = eventFull;
                this.filtered = this.compute(this.eventFull.attendees, this.searchQuery);
                this._eventData.updateCurrentEvent(this.eventItem, this.eventFull);
                refresher.complete();
            },
            error => {
                this._uiUtils.alert(this._nav, 'Fail to update :(');
                refresher.complete();
            }
        );
    }

    search() {
        this.filtered = this.compute(this.eventFull.attendees, this.searchQuery);
    }

    compute(items: AttendeeFull[], q: string): Array<any> {
        function filter(items: AttendeeFull[], q: string): AttendeeFull[] {
            return q.trim() === '' ? items : items.filter(item => Filter.deep(item, q));
        }
        function group(items: AttendeeFull[]): Array<any> {
            let grouped = _.groupBy(items, i => i.lastName[0]);
            let ret = [];
            for(let key in grouped){
                ret.push({
                    title: key.toUpperCase(),
                    items: grouped[key]
                });
            }
            return ret.sort((e1, e2) => Sort.str(e1.title, e2.title));
        }
        return group(filter(items, q));
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

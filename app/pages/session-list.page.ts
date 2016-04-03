import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {NavController} from "ionic-angular/index";
import * as _ from "lodash";
import {EventFull} from "../models/EventFull";
import {EventItem} from "../models/EventItem";
import {SessionFull} from "../models/SessionFull";
import {EventService} from "../common/event.service";
import {Filter, Sort} from "../common/utils/array";
import {WeekDayPipe, TimePipe} from "../common/pipes/datetime.pipe";
import {CapitalizePipe} from "../common/pipes/text.pipe";
import {UiUtils} from "../common/ui/utils";
import {SessionPage} from "./session.page";

@Page({
    styles: [`
.item h2 {
    white-space: initial;
}
    `],
    template: `
<ion-navbar *navbar>
    <ion-title>{{eventItem.name}}</ion-title>
</ion-navbar>
<ion-toolbar>
    <ion-searchbar [(ngModel)]="searchQuery" (input)="search()" debounce="500"></ion-searchbar>
</ion-toolbar>
<ion-content class="session-list-page">
    <ion-refresher (refresh)="doRefresh($event)"></ion-refresher>
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list-header *ngIf="eventFull && filtered.length === 0">Pas de session trouvée</ion-list-header>
    <ion-list *ngIf="eventFull && filtered.length > 0">
        <ion-item-group *ngFor="#group of filtered">
            <ion-item-divider sticky>{{group.title}}</ion-item-divider>
            <ion-item *ngFor="#session of group.items" (click)="goToSession(session)">
                <h2>{{session.name}}</h2>
                <p>{{session.start | time}}-{{session.end | time}} {{session.place}} {{session.category}}</p>
                <p><span *ngFor="#p of session.speakers" class="label">{{p.name}} </span></p>
            </ion-item>
        </ion-item-group>
    </ion-list>
</ion-content>
`,
    pipes: [TimePipe]
})
export class SessionListPage implements OnInit {
    searchQuery: string = '';
    eventItem: EventItem;
    eventFull: EventFull;
    filtered: Array<any> = [];
    constructor(private _eventService: EventService,
                private _nav: NavController,
                private _weekDayPipe: WeekDayPipe,
                private _timePipe: TimePipe,
                private _capitalizePipe: CapitalizePipe,
                private _uiUtils: UiUtils) {}

    ngOnInit() {
        this.eventItem = this._eventService.getCurrentEventItem();
        this._eventService.getCurrentEventFull().then(event => {
            this.eventFull = event;
            this.filtered = this.compute(this.eventFull.sessions, this.searchQuery);
        });
    }

    doRefresh(refresher) {
        this._eventService.fetchEvent(this.eventItem.uuid).then(
            eventFull => {
                this.eventItem = EventFull.toItem(eventFull);
                this.eventFull = eventFull;
                this.filtered = this.compute(this.eventFull.sessions, this.searchQuery);
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
        this.filtered = this.compute(this.eventFull.sessions, this.searchQuery);
    }

    compute(items: SessionFull[], q: string): Array<any> {
        let that = this;
        function filter(items: SessionFull[], q: string): SessionFull[] {
            return q.trim() === '' ? items : items.filter(item => Filter.deep(item, q));
        }
        function group(items: SessionFull[]): Array<any> {
            let grouped = _.groupBy(items, 'start');
            let ret = [];
            for(let key in grouped){
                let time = parseInt(key, 10);
                ret.push({
                    title: that._capitalizePipe.transform(that._weekDayPipe.transform(time))+', '+that._timePipe.transform(time),
                    time: time,
                    items: grouped[key]
                });
            }
            return ret.sort((e1, e2) => Sort.num(e1.time, e2.time));
        }
        return group(filter(items, q));
    }

    goToSession(sessionFull: SessionFull) {
        this._nav.push(SessionPage, {
            sessionItem: SessionFull.toItem(sessionFull)
        });
    }
}

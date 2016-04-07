import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {NavController} from "ionic-angular/index";
import * as _ from "lodash";
import {EventFull} from "./models/EventFull";
import {EventItem} from "./models/EventItem";
import {SessionFull} from "./models/SessionFull";
import {EventData} from "./services/event.data";
import {Sort} from "../common/utils/array";
import {WeekDayPipe, TimePipe, TimePeriodPipe} from "../common/pipes/datetime.pipe";
import {CapitalizePipe} from "../common/pipes/text.pipe";
import {SessionPage} from "./session.page";

@Page({
    styles: [`
.item h2 {
    white-space: initial;
}
    `],
    template: `
<ion-navbar *navbar>
    <ion-title>Mon programme</ion-title>
</ion-navbar>
<ion-content class="program-page">
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list-header *ngIf="eventFull && filtered.length === 0">Aucune session ajoutée au programme :(</ion-list-header>
    <ion-list *ngIf="eventFull && filtered.length > 0">
        <ion-item-group *ngFor="#group of filtered">
            <ion-item-divider sticky>{{group.title}}</ion-item-divider>
            <ion-item *ngFor="#session of group.items" (click)="goToSession(session)">
                <h2>{{session.name}}</h2>
                <p>{{session.start | timePeriod:session.end}} {{session.place}} {{session.category}}</p>
                <p><span *ngFor="#p of session.speakers" class="label">{{p.name}} </span></p>
                <button clear item-right (click)="unFav(session);$event.stopPropagation();">
                    <ion-icon name="star"></ion-icon>
                </button>
            </ion-item>
        </ion-item-group>
    </ion-list>
</ion-content>
`,
    pipes: [TimePeriodPipe]
})
export class ProgramPage implements OnInit {
    eventItem: EventItem;
    eventFull: EventFull;
    filtered: Array<any> = [];
    favorites: { [key: string]: boolean; } = {};
    constructor(private _nav: NavController,
                private _eventData: EventData,
                private _weekDayPipe: WeekDayPipe,
                private _timePipe: TimePipe,
                private _capitalizePipe: CapitalizePipe) {}

    // TODO : refresh program on-enter (with updated favorites)
    ngOnInit() {
        this.eventItem = this._eventData.getCurrentEventItem();
        setTimeout(() => {
            this._eventData.getCurrentEventFull().then(event => {
                this.eventFull = event;
                this._eventData.getFavoriteSessions().then(favorites => {
                    this.favorites = favorites;
                    this.filtered = this.compute(this.eventFull.sessions, this.favorites);
                });
            });
        }, 600);
    }

    compute(items: SessionFull[], favorites: { [key: string]: boolean; }): Array<any> {
        let that = this;
        function filter(items: SessionFull[], favorites: { [key: string]: boolean; }): SessionFull[] {
            return items.filter(item => favorites[item.uuid]);
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
        return group(filter(items, favorites));
    }

    unFav(sessionFull: SessionFull) {
        this._eventData.unfavoriteSession(SessionFull.toItem(sessionFull)).then(() => {
            this.filtered = this.compute(this.eventFull.sessions, this.favorites);
        });
    }

    goToSession(sessionFull: SessionFull) {
        this._nav.push(SessionPage, {
            sessionItem: SessionFull.toItem(sessionFull)
        });
    }
}

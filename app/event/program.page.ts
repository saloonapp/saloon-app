import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {NavController} from "ionic-angular/index";
import * as _ from "lodash";
import {EventFull} from "./models/EventFull";
import {EventItem} from "./models/EventItem";
import {SessionFull} from "./models/SessionFull";
import {EventData} from "./services/event.data";
import {Sort} from "../common/utils/array";
import {TimePeriodPipe} from "../common/pipes/datetime.pipe";
import {MapPipe, NotEmptyPipe, JoinPipe} from "../common/pipes/array.pipe";
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
    <ion-list-header *ngIf="eventFull && !hasFavs()">Aucune session ajoutée au programme :(</ion-list-header>
    <ion-list *ngIf="eventFull && hasFavs()">
        <ion-item *ngFor="#session of eventFull.sessions" [hidden]="!isFav(session)" (click)="goToSession(session)">
            <h2>{{session.name}}</h2>
            <p>{{[session.place, session.category, session.start | timePeriod:session.end] | notEmpty | join:' - '}}</p>
            <p>{{session.speakers | map:'name' | join:', '}}</p>
            <button clear item-right (click)="unFav(session);$event.stopPropagation();">
                <ion-icon name="star"></ion-icon>
            </button>
        </ion-item>
    </ion-list>
</ion-content>
`,
    pipes: [TimePeriodPipe, MapPipe, NotEmptyPipe, JoinPipe]
})
export class ProgramPage implements OnInit {
    eventItem: EventItem;
    eventFull: EventFull;
    constructor(private _nav: NavController,
                private _eventData: EventData) {}

    // TODO : create Pipe 'filter' to filter sessions instead of hide them
    ngOnInit() {
        this.eventItem = this._eventData.getCurrentEventItem();
        setTimeout(() => {
            this._eventData.getCurrentEventFull().then(eventFull => {
                this.eventFull = eventFull;
            });
        }, 600);
    }

    hasFavs(): boolean {
        return this._eventData.hasFavoriteSessions();
    }

    isFav(sessionFull: SessionFull): boolean {
        return this._eventData.isFavoriteSession(sessionFull);
    }

    unFav(sessionFull: SessionFull) {
        this._eventData.unfavoriteSession(SessionFull.toItem(sessionFull));
    }

    goToSession(sessionFull: SessionFull) {
        this._nav.push(SessionPage, {
            sessionItem: SessionFull.toItem(sessionFull)
        });
    }
}

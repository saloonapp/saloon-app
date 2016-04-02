import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {NavController} from "ionic-angular/index";
import {EventFull} from "../models/EventFull";
import {EventItem} from "../models/EventItem";
import {SessionFull} from "../models/SessionFull";
import {TimePipe} from "../common/pipes/datetime.pipe";
import {EventService} from "../common/event.service";
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
<ion-content class="session-list-page">
    <ion-refresher (refresh)="doRefresh($event)"></ion-refresher>
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list *ngIf="eventFull">
        <ion-item *ngFor="#session of eventFull.sessions" (click)="goToSession(session)">
            <h2>{{session.name}}</h2>
            <p>{{session.start | time}}-{{session.end | time}} {{session.place}} {{session.category}}</p>
            <p><span *ngFor="#p of session.speakers" class="label">{{p.name}} </span></p>
        </ion-item>
    </ion-list>
</ion-content>
`,
    pipes: [TimePipe]
})
export class SessionListPage implements OnInit {
    eventItem: EventItem;
    eventFull: EventFull;
    constructor(private _eventService: EventService,
                private _nav: NavController,
                private _uiUtils: UiUtils) {}

    ngOnInit() {
        this.eventItem = this._eventService.getCurrentEventItem();
        this._eventService.getCurrentEventFull().then(event => {
            console.log('eventFull', event);
            this.eventFull = event
        });
    }

    doRefresh(refresher) {
        this._eventService.fetchEvent(this.eventItem.uuid).then(
            eventFull => {
                this.eventItem = EventFull.toItem(eventFull);
                this.eventFull = eventFull;
                this._eventService.updateCurrentEvent(this.eventItem, this.eventFull);
                refresher.complete();
            },
            error => {
                this._uiUtils.alert(this._nav, 'Fail to update :(');
                refresher.complete();
            }
        );
    }

    goToSession(sessionFull: SessionFull) {
        this._nav.push(SessionPage, {
            sessionItem: SessionFull.toItem(sessionFull)
        });
    }
}

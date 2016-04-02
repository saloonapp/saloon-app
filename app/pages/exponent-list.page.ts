import {Page} from 'ionic-angular';
import {NavController} from "ionic-angular/index";
import {EventFull} from "../models/EventFull";
import {EventItem} from "../models/EventItem";
import {ExponentFull} from "../models/ExponentFull";
import {EventService} from "../common/event.service";
import {UiUtils} from "../common/ui/utils";
import {ExponentPage} from "./exponent.page";

@Page({
    template: `
<ion-navbar *navbar>
  <ion-title>Exponent list</ion-title>
</ion-navbar>
<ion-content class="exponent-list-page">
    <ion-refresher (refresh)="doRefresh($event)"></ion-refresher>
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list *ngIf="eventFull">
        <ion-item *ngFor="#exponent of eventFull.exponents" (click)="goToExponent(exponent)">
            <h2>{{exponent.name}}</h2>
        </ion-item>
    </ion-list>
</ion-content>
`,
})
export class ExponentListPage {
    eventItem: EventItem;
    eventFull: EventFull;
    constructor(private _eventService: EventService,
                private _nav: NavController,
                private _uiUtils: UiUtils) {}

    ngOnInit() {
        this.eventItem = this._eventService.getCurrentEventItem();
        this._eventService.getCurrentEventFull().then(event => this.eventFull = event);
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

    goToExponent(exponentFull: ExponentFull) {
        this._nav.push(ExponentPage, {
            exponentItem: ExponentFull.toItem(exponentFull)
        });
    }
}

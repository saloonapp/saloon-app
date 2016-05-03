import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {NavController} from "ionic-angular/index";
import {EventItem, EventFull} from "./models/Event";
import {EventData} from "./services/event.data";
import {EventService} from "./services/event.service";
import {UiHelper} from "../common/ui/utils";
import {DatePeriodPipe} from "../common/pipes/datetime.pipe";
import {AddressPipe} from "../common/pipes/model.pipe";

@Page({
    pipes: [DatePeriodPipe, AddressPipe],
    styles: [`
.infos-page img {
    width: 100%;
}
.about-info p {
  color: #697072;
}
.about-info div {
  padding: 5px;
  text-align: left;
  font-size: 1.5rem;
}
.about-info ion-icon {
  width: 20px;
}
    `],
    template: `
<ion-navbar *navbar>
    <button menuToggle><ion-icon name="menu"></ion-icon></button>
    <ion-title>Infos</ion-title>
</ion-navbar>
<ion-content class="infos-page">
    <ion-refresher (refresh)="doRefresh($event)"><ion-refresher-content></ion-refresher-content></ion-refresher>
    <div class="about-header">
        <img [src]="eventItem.landing">
    </div>
    <div padding class="about-info">
        <h4>{{eventItem.name}}</h4>
        <div *ngIf="eventItem.start"><ion-icon name="calendar"></ion-icon> {{eventItem.start | datePeriod:eventItem.end}}</div>
        <div *ngIf="eventItem.address">
            <a href="http://maps.google.com/?q={{eventItem.address | address}}">
                <ion-icon name="pin"></ion-icon> {{eventItem.address | address}}
            </a>
        </div>
        <div *ngIf="eventItem.price">
            <a href="{{eventItem.priceUrl}}">
                <ion-icon name="pricetag"></ion-icon> {{eventItem.price}}
            </a>
        </div>
        <p [innerHTML]="eventItem.descriptionHTML"></p>
    </div>
</ion-content>
`
})
export class InfosPage implements OnInit {
    eventItem: EventItem;
    constructor(private _nav: NavController,
                private _eventData: EventData,
                private _eventService: EventService,
                private _uiHelper: UiHelper) {}

    ngOnInit() {
        this.eventItem = this._eventData.getCurrentEventItem();
    }

    doRefresh(refresher) {
        this._eventService.fetchEvent(this.eventItem.uuid).then(
            eventFull => {
                this.eventItem = eventFull.toItem();
                this._eventData.setCurrentEvent(this.eventItem, eventFull);
                refresher.complete();
            },
            error => {
                this._uiHelper.alert(this._nav, 'Fail to update :(', 'You can retry...');
                refresher.complete();
            }
        );
    }
}

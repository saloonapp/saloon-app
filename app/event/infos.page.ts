import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {EventItem} from "./models/EventItem";
import {EventService} from "./services/event.service";
import {DatePeriodPipe} from "../common/pipes/datetime.pipe";
import {AddressPipe} from "../common/pipes/model.pipe";

@Page({
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
    <ion-title>Infos</ion-title>
</ion-navbar>
<ion-content class="infos-page">
    <div class="about-header">
        <img src="{{eventItem.landing}}">
    </div>
    <div padding class="about-info">
        <h4>{{eventItem.name}}</h4>
        <div *ngIf="eventItem.start"><ion-icon name="calendar"></ion-icon> {{eventItem.start | datePeriod:eventItem.end}}</div>
        <div *ngIf="eventItem.address">
            <a href="http://maps.google.com/?q={{eventItem.address | address}}">
                <ion-icon name="pin"></ion-icon> {{eventItem.address.city}}
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
`,
    pipes: [DatePeriodPipe, AddressPipe]
})
export class InfosPage implements OnInit {
    eventItem: EventItem;
    constructor(private _eventService: EventService) {}

    ngOnInit() {
        this.eventItem = this._eventService.getCurrentEventItem();
        console.log('this.eventItem', this.eventItem);
    }
}

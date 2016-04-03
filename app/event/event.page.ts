import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {NavController, NavParams} from "ionic-angular/index";
import {EventFull} from "./models/EventFull";
import {EventItem} from "./models/EventItem";
import {EventService} from "./services/event.service";
import {UiUtils} from "../common/ui/utils";
import {AttendeeListPage} from "./attendee-list.page";
import {SessionListPage} from "./session-list.page";
import {ExponentListPage} from "./exponent-list.page";
import {InfosPage} from "./infos.page";


@Page({
    template: `
<ion-tabs>
  <ion-tab [root]="tab1Root" tabTitle="Sessions" *ngIf="eventItem.sessionCount > 0"></ion-tab>
  <ion-tab [root]="tab2Root" tabTitle="Participants" *ngIf="eventItem.attendeeCount > 0"></ion-tab>
  <ion-tab [root]="tab3Root" tabTitle="Exposants" *ngIf="eventItem.exponentCount > 0"></ion-tab>
  <ion-tab [root]="tab4Root" tabTitle="Infos" *ngIf="eventItem"></ion-tab>
</ion-tabs>
`
})
export class EventPage implements OnInit {
    eventItem: EventItem;
    tab1Root: any = SessionListPage;
    tab2Root: any = AttendeeListPage;
    tab3Root: any = ExponentListPage;
    tab4Root: any = InfosPage;
    constructor(private _eventService: EventService,
                private _navParams: NavParams) {}

    ngOnInit() {
        this.eventItem = <EventItem> this._navParams.get('eventItem');
        this._eventService.setCurrentEvent(this.eventItem);
    }
}

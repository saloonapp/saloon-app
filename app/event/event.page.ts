import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {NavController, NavParams} from "ionic-angular/index";
import {EventFull} from "./models/EventFull";
import {EventItem} from "./models/EventItem";
import {EventData} from "./services/event.data";
import {UiUtils} from "../common/ui/utils";
import {AttendeeListPage} from "./attendee-list.page";
import {SessionListPage} from "./session-list.page";
import {ExponentListPage} from "./exponent-list.page";
import {ProgramPage} from "./program.page";
import {InfosPage} from "./infos.page";


@Page({
    template: `
<ion-tabs>
  <ion-tab [root]="tab1Root" tabTitle="Sessions" *ngIf="eventItem.sessionCount > 0"></ion-tab>
  <ion-tab [root]="tab2Root" tabTitle="Participants" *ngIf="eventItem.attendeeCount > 0"></ion-tab>
  <ion-tab [root]="tab3Root" tabTitle="Exposants" *ngIf="eventItem.exponentCount > 0"></ion-tab>
  <ion-tab [root]="tab4Root" tabTitle="Programme" *ngIf="eventItem"></ion-tab>
  <ion-tab [root]="tab5Root" tabTitle="Infos" *ngIf="eventItem"></ion-tab>
</ion-tabs>
`
})
export class EventPage implements OnInit {
    eventItem: EventItem;
    tab1Root: any = SessionListPage;
    tab2Root: any = AttendeeListPage;
    tab3Root: any = ExponentListPage;
    tab4Root: any = ProgramPage;
    tab5Root: any = InfosPage;
    constructor(private _navParams: NavParams,
                private _eventData: EventData) {}

    ngOnInit() {
        this.eventItem = <EventItem> this._navParams.get('eventItem');
        this._eventData.setCurrentEvent(this.eventItem);
    }
}

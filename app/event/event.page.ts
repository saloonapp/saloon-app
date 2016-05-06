import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {IonicApp, NavController, NavParams} from "ionic-angular/index";
import {EventItem, EventFull} from "./models/Event";
import {EventData} from "./services/event.data";
import {EventService} from "./services/event.service";
import {UiHelper} from "../common/ui/utils";
import {AttendeeListPage} from "./attendee-list.page";
import {SessionListPage} from "./session-list.page";
import {ExponentListPage} from "./exponent-list.page";
import {ProgramPage} from "./program.page";
import {InfosPage} from "./infos.page";
import {EventListPage} from "./event-list.page";
import {SettingsPage} from "../settings/settings.page";


@Page({
    template: `
<ion-menu [content]="content">
    <ion-toolbar>
        <ion-title>Menu</ion-title>
    </ion-toolbar>
    <ion-content>
        <ion-list>
            <ion-list-header>{{eventItem.name}}</ion-list-header>
            <button ion-item menuClose (click)="goToSessions()" *ngIf="eventItem.sessionCount > 0"><ion-icon item-left name="calendar"></ion-icon> Sessions</button>
            <button ion-item menuClose (click)="goToAttendee()" *ngIf="eventItem.attendeeCount > 0"><ion-icon item-left name="people"></ion-icon> Participants</button>
            <button ion-item menuClose (click)="goToExponent()" *ngIf="eventItem.exponentCount > 0"><ion-icon item-left name="briefcase"></ion-icon> Exposants</button>
            <button ion-item menuClose (click)="goToProgram()" *ngIf="eventItem.sessionCount > 0"><ion-icon item-left name="bookmarks"></ion-icon> Programme</button>
            <button ion-item menuClose (click)="goToInfos()" *ngIf="eventItem"><ion-icon item-left name="information-circle"></ion-icon> Infos</button>
            <button ion-item menuClose (click)="updateEvent()" *ngIf="eventItem">Mettre à jour les données</button>
        </ion-list>
        <ion-list>
            <ion-list-header>Autre</ion-list-header>
            <button ion-item menuClose (click)="goToEvents()"><ion-icon item-left name="list"></ion-icon> Tous les événements</button>
            <button ion-item menuClose (click)="goToSettings()"><ion-icon item-left name="settings"></ion-icon> Paramètres</button>
        </ion-list>
    </ion-content>
</ion-menu>
<ion-tabs id="event-tabs" #content>
    <ion-tab [root]="tab1Root" tabTitle="Sessions" tabIcon="calendar" *ngIf="eventItem.sessionCount > 0"></ion-tab>
    <ion-tab [root]="tab2Root" tabTitle="Participants" tabIcon="people" *ngIf="eventItem.attendeeCount > 0"></ion-tab>
    <ion-tab [root]="tab3Root" tabTitle="Exposants" tabIcon="briefcase" *ngIf="eventItem.exponentCount > 0"></ion-tab>
    <ion-tab [root]="tab4Root" tabTitle="Programme" tabIcon="bookmarks" *ngIf="eventItem.sessionCount > 0"></ion-tab>
    <ion-tab [root]="tab5Root" tabTitle="Infos" tabIcon="information-circle" *ngIf="eventItem"></ion-tab>
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
    constructor(private _app: IonicApp,
                private _nav: NavController,
                private _navParams: NavParams,
                private _eventService: EventService,
                private _eventData: EventData,
                private _uiHelper: UiHelper) {}

    ngOnInit() {
        this.eventItem = <EventItem> this._navParams.get('eventItem');
        this._eventData.setCurrentEvent(this.eventItem);
    }

    goToSessions() { this.goToTab('Sessionsd'); }
    goToAttendee() { this.goToTab('Participants'); }
    goToExponent() { this.goToTab('Exposants'); }
    goToProgram() { this.goToTab('Programme'); }
    goToInfos() { this.goToTab('Infos'); }
    updateEvent() { this.doRefresh(); }
    goToEvents() { this._nav.setRoot(EventListPage); }
    goToSettings() { this._nav.push(SettingsPage); }

    private goToTab(title: string) {
        const tabs = this._app.getComponent('event-tabs');
        let tabIndex = 0;
        let tab = tabs.getByIndex(tabIndex);
        while(tab) {
            if(tab.tabTitle === title){
                tabs.select(tabIndex);
                break;
            }
            tab = tabs.getByIndex(++tabIndex);
        }
        if(tab === null){ console.warn('Tab <'+title+'> not found !'); }
    }
    doRefresh() {
        this._uiHelper.showLoading(this._nav);
        this._eventService.fetchEvent(this.eventItem.uuid).then(
            eventFull => {
                this.eventItem = eventFull.toItem();
                this._eventData.setCurrentEvent(this.eventItem, eventFull);
                this._uiHelper.hideLoading();
            },
            error => {
                this._uiHelper.alert(this._nav, 'Fail to update :(', 'You can retry...');
            }
        );
    }
}

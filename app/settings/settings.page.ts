import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {NavController} from "ionic-angular/index";
import {Config} from "../config";
import {Storage} from "../common/storage.service";

@Page({
    template: `
<ion-navbar *navbar>
    <button menuToggle><ion-icon name="menu"></ion-icon></button>
    <ion-title>Paramètres</ion-title>
</ion-navbar>
<ion-content>
    <ion-list>
        <ion-item>Version: {{config.appVersion}}</ion-item>
    </ion-list>
    <ion-list>
        <ion-item>{{storage.eventCount}} événements listés</ion-item>
        <ion-item *ngFor="#event of storage.events">
            <h2>{{event.name}}</h2>
            <p>{{event.sessionCount}} sessions, {{event.attendeeCount}} participants, {{event.exponentCount}} exposants, {{event.actionCount}} actions</p>
        </ion-item>
    </ion-list>
</ion-content>
`
})
export class SettingsPage implements OnInit {
    config: any = Config;
    storage: any = {};
    constructor(private _storage: Storage) {}

    ngOnInit() {
        this._storage.getEvents().then(eventList => {
            this.storage.eventCount = (eventList.events || []).length;
            this.storage.events = [];
            (eventList.events || []).map(e => {
                const storageEvent: any = {};
                this._storage.getEvent(e.uuid).then(event => {
                    storageEvent.uuid = event.uuid;
                    storageEvent.name = event.name;
                    storageEvent.sessionCount = event.sessions.length;
                    storageEvent.attendeeCount = event.attendees.length;
                    storageEvent.exponentCount = event.exponents.length;
                    this.storage.events.push(storageEvent);
                });
                this._storage.getUserActions(e.uuid).then(actions => {
                    storageEvent.actionCount = actions.length;
                });
            });
        });
    }
}

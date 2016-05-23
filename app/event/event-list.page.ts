import {OnInit} from "@angular/core";
import {Page} from "ionic-angular";
import {NavController} from "ionic-angular/index";
import {EventList, EventItem} from "./models/Event";
import {EventItemComponent} from "./components/event-item.component";
import {EventService} from "./services/event.service";
import {DateHelper} from "../common/utils/date";
import {UiHelper} from "../common/ui/utils";
import {EventPage} from "./event.page.ts";
import {Config} from "../config";
import {Sort} from "../common/utils/array";

@Page({
    directives: [EventItemComponent],
    template: `
<ion-navbar *navbar>
    <ion-title>{{config.debug ? '('+config.envName+') ' : ''}}Événements</ion-title>
</ion-navbar>
<ion-toolbar>
    <ion-segment [(ngModel)]="segmentValue" (change)="updateSegment()">
        <ion-segment-button *ngFor="let s of segmentValues" value="{{s.value}}">{{s.label}}</ion-segment-button>
    </ion-segment>
</ion-toolbar>
<ion-content>
    <ion-refresher (refresh)="doRefresh($event)"><ion-refresher-content></ion-refresher-content></ion-refresher>
    <div *ngIf="!events" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <event-item *ngFor="let event of showedEvents" [event]="event" [format]="eventFormat" (click)="goToEvent(event)"></event-item>
    <div *ngIf="segmentValue === 'future'" padding>
        <h1 *ngIf="showedEvents && showedEvents.length === 0">Aucun événement à venir :(</h1>
        <p>
            Si votre événement n'est pas référencé ici, nous pouvons l'ajouter.<br>
            Pour ça, il vous suffit de <a href="mailto:{{emailSupport}}?subject=[SalooN] Ajout d'événement&body=Salut, pouvez-vous ajouter l'événement ... (nom, date, lieu...)" target="_blank">nous l'indiquer</a>.
        </p>
    </div>
</ion-content>
`
})
export class EventListPage implements OnInit {
    config: any = Config;
    segmentValues = [
        {value: 'future', label: 'À venir', format: 'card', filter: (e: EventItem) => (e.end || e.start)+(1*DateHelper.day) > DateHelper.now(), sort: (e1: EventItem, e2: EventItem) => Sort.num(e1.start, e2.start)},
        {value: 'past',   label: 'Passés', format: 'item', filter: (e: EventItem) => (e.end || e.start)+(1*DateHelper.day) < DateHelper.now(), sort: (e1: EventItem, e2: EventItem) => -Sort.num(e1.start, e2.start)}
    ];
    segmentValue: string = this.segmentValues[0].value;
    eventFormat: string = this.segmentValues[0].format;
    events: EventItem[];
    showedEvents: EventItem[];
    emailSupport: string = Config.emailSupport;
    constructor(private _nav: NavController,
                private _eventService: EventService,
                private _uiHelper: UiHelper) {}

    ngOnInit() {
        this._eventService.getEvents().then(
            eventList => this.updateEvents(eventList),
            error => this._uiHelper.alert(this._nav, 'Fail to update :(')
        );
    }

    doRefresh(refresher) {
        this._eventService.fetchEvents().then(
            eventList => {
                this.updateEvents(eventList);
                refresher.complete();
            },
            error => {
                this._uiHelper.alert(this._nav, 'Fail to update :(');
                refresher.complete();
            }
        );
    }

    updateEvents(eventList: EventList) {
        this.events = eventList.events;
        this.updateSegment();
    }

    updateSegment() {
        const segment = this.segmentValues.find(s => s.value === this.segmentValue);
        this.eventFormat = segment ? segment.format : this.segmentValues[0].format;
        this.showedEvents = segment && this.events ? this.events.filter(segment.filter).sort(segment.sort) : this.events;
    }

    goToEvent(eventItem: EventItem) {
        this._uiHelper.showLoading(this._nav);
        this._nav.push(EventPage, {
            eventItem: eventItem
        });
    }
}

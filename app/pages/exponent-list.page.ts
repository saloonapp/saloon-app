import {Page} from 'ionic-angular';
import {NavController} from "ionic-angular/index";
import {EventFull} from "../models/EventFull";
import {EventItem} from "../models/EventItem";
import {ExponentFull} from "../models/ExponentFull";
import {EventService} from "../common/event.service";
import {Filter, Sort} from "../common/utils/array";
import {UiUtils} from "../common/ui/utils";
import {ExponentPage} from "./exponent.page";

@Page({
    template: `
<ion-navbar *navbar>
  <ion-title>Exposants</ion-title>
</ion-navbar>
<ion-toolbar>
    <ion-searchbar [(ngModel)]="searchQuery" (input)="search()" debounce="500"></ion-searchbar>
</ion-toolbar>
<ion-content class="exponent-list-page">
    <ion-refresher (refresh)="doRefresh($event)"></ion-refresher>
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list-header *ngIf="eventFull && filtered.length === 0">Pas d'exposant trouvé</ion-list-header>
    <ion-list *ngIf="eventFull && filtered.length > 0">
        <ion-item-group *ngFor="#group of filtered">
            <ion-item-divider sticky>{{group.title}}</ion-item-divider>
            <ion-item *ngFor="#exponent of group.items" (click)="goToExponent(exponent)">
                <h2>{{exponent.name}}</h2>
            </ion-item>
        </ion-item-group>
    </ion-list>
</ion-content>
`,
})
export class ExponentListPage {
    searchQuery: string = '';
    eventItem: EventItem;
    eventFull: EventFull;
    filtered: Array<any> = [];
    constructor(private _eventService: EventService,
                private _nav: NavController,
                private _uiUtils: UiUtils) {}

    ngOnInit() {
        this.eventItem = this._eventService.getCurrentEventItem();
        this._eventService.getCurrentEventFull().then(event => {
            this.eventFull = event;
            this.filtered = this.compute(this.eventFull.exponents, this.searchQuery);
        });
    }

    doRefresh(refresher) {
        this._eventService.fetchEvent(this.eventItem.uuid).then(
            eventFull => {
                this.eventItem = EventFull.toItem(eventFull);
                this.eventFull = eventFull;
                this.filtered = this.compute(this.eventFull.exponents, this.searchQuery);
                this._eventService.updateCurrentEvent(this.eventItem, this.eventFull);
                refresher.complete();
            },
            error => {
                this._uiUtils.alert(this._nav, 'Fail to update :(');
                refresher.complete();
            }
        );
    }

    search() {
        this.filtered = this.compute(this.eventFull.exponents, this.searchQuery);
    }

    compute(items: ExponentFull[], q: string): Array<any> {
        function filter(items: ExponentFull[], q: string): ExponentFull[] {
            return q.trim() === '' ? items : items.filter(item => Filter.deep(item, q));
        }
        function group(items: ExponentFull[]): Array<any> {
            let grouped = _.groupBy(items, i => i.name[0]);
            let ret = [];
            for(let key in grouped){
                ret.push({
                    title: key.toUpperCase(),
                    items: grouped[key]
                });
            }
            return ret.sort((e1, e2) => Sort.str(e1.title, e2.title));
        }
        return group(filter(items, q));
    }

    goToExponent(exponentFull: ExponentFull) {
        this._nav.push(ExponentPage, {
            exponentItem: ExponentFull.toItem(exponentFull)
        });
    }
}

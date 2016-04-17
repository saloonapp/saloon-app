import {Page} from "ionic-angular";
import {NavController} from "ionic-angular/index";
import * as _ from "lodash";
import {EventFull} from "./models/EventFull";
import {EventItem} from "./models/EventItem";
import {ExponentFull} from "./models/ExponentFull";
import {EventData} from "./services/event.data";
import {Filter, Sort} from "../common/utils/array";
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
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list-header *ngIf="eventFull && filtered.length === 0">Pas d'exposant trouvé</ion-list-header>
    <ion-list *ngIf="eventFull && filtered.length > 0">
        <ion-item-group *ngFor="#group of filtered">
            <ion-item-divider sticky>{{group.title}}</ion-item-divider>
            <ion-item *ngFor="#exponent of group.items" (click)="goToExponent(exponent)">
                <ion-avatar item-left><img [src]="exponent.logo"></ion-avatar>
                <h2>{{exponent.name}}</h2>
                <p class="nowrap lines2">{{exponent.description}}</p>
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
    constructor(private _nav: NavController,
                private _eventData: EventData) {}

    // TODO http://ionicframework.com/docs/v2/api/components/virtual-scroll/VirtualScroll/
    ngOnInit() {
        this.eventItem = this._eventData.getCurrentEventItem();
        setTimeout(() => {
            this._eventData.getCurrentEventFull().then(event => {
                this.eventFull = event;
                this.filtered = ExponentListHelper.compute(this.eventFull.exponents, this.searchQuery);
            });
        }, 600);
    }

    search() {
        this.filtered = ExponentListHelper.compute(this.eventFull.exponents, this.searchQuery);
    }

    goToExponent(exponentFull: ExponentFull) {
        this._nav.push(ExponentPage, {
            exponentItem: ExponentFull.toItem(exponentFull)
        });
    }
}

class ExponentListHelper {
    public static compute(items: ExponentFull[], q: string): Array<any> {
        function group(items: ExponentFull[]): Array<any> {
            const grouped = _.groupBy(items, i => i.name[0]);
            const ret = [];
            for(let key in grouped){
                ret.push({
                    title: key.toUpperCase(),
                    items: grouped[key]
                });
            }
            return ret.sort((e1, e2) => Sort.str(e1.title, e2.title));
        }
        return group(Filter.deep(items, q));
    }
}
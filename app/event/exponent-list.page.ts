import {Page} from "ionic-angular";
import {NavController} from "ionic-angular/index";
import {EventFull} from "./models/EventFull";
import {EventItem} from "./models/EventItem";
import {ExponentFull} from "./models/ExponentFull";
import {EventData} from "./services/event.data";
import {ArrayHelper, ItemGroup, Filter, Sort} from "../common/utils/array";
import {UiHelper} from "../common/ui/utils";
import {ExponentPage} from "./exponent.page";

@Page({
    template: `
<ion-navbar *navbar>
    <button menuToggle><ion-icon name="menu"></ion-icon></button>
    <ion-title>Exposants</ion-title>
</ion-navbar>
<ion-toolbar>
    <ion-searchbar [(ngModel)]="searchQuery" (input)="search()" debounce="500"></ion-searchbar>
</ion-toolbar>
<ion-content class="exponent-list-page">
    <div *ngIf="!eventFull" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list-header *ngIf="eventFull && filtered.length === 0">Pas d'exposant trouvé</ion-list-header>
    <ion-list *ngIf="eventFull && filtered.length > 0" [virtualScroll]="filtered" [headerFn]="virtualHeader">
        <ion-item-divider *virtualHeader="#letter" sticky>{{letter}}</ion-item-divider>
        <ion-item *virtualItem="#exponent" (click)="goToExponent(exponent)">
            <ion-avatar item-left><ion-img [src]="exponent.logo"></ion-img></ion-avatar>
            <h2>{{exponent.name}}</h2>
            <p class="nowrap lines2">{{exponent.description}}</p>
            <button clear item-right (click)="toggleFav(exponent);$event.stopPropagation();">
                <ion-icon name="star" [hidden]="!isFav(exponent)"></ion-icon>
                <ion-icon name="star-outline" [hidden]="isFav(exponent)"></ion-icon>
            </button>
        </ion-item>
    </ion-list>
</ion-content>
`,
})
export class ExponentListPage {
    eventItem: EventItem;
    eventFull: EventFull;
    searchQuery: string = '';
    filtered: ExponentFull[] = [];
    constructor(private _nav: NavController,
                private _eventData: EventData,
                private _uiHelper: UiHelper) {}

    ngOnInit() {
        this.eventItem = this._eventData.getCurrentEventItem();
        this._eventData.getCurrentEventFull().then(event => {
            this.eventFull = event;
            this.filtered = Filter.deep(this.eventFull.exponents, this.searchQuery);
            this._uiHelper.hideLoading();
        });
    }

    search() {
        this.filtered = Filter.deep(this.eventFull.exponents, this.searchQuery);
    }

    virtualHeader(item, index, array) {
        if(index === 0 || item.name[0].toUpperCase() !== array[index-1].name[0].toUpperCase()) {
            return item.name[0].toUpperCase();
        }
        return null;
    }

    isFav(exponent: ExponentFull): boolean {
        return this._eventData.isFavoriteExponent(exponent);
    }

    toggleFav(exponent: ExponentFull) {
        this._eventData.toggleFavoriteExponent(exponent);
    }

    goToExponent(exponentFull: ExponentFull) {
        this._nav.push(ExponentPage, {
            exponentItem: ExponentFull.toItem(exponentFull)
        });
    }
}

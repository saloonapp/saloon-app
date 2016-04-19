import {Page} from "ionic-angular";
import {NavController} from "ionic-angular/index";
import {EventFull} from "./models/EventFull";
import {EventItem} from "./models/EventItem";
import {ExponentFull} from "./models/ExponentFull";
import {EventData} from "./services/event.data";
import {ArrayHelper, ItemGroup, Filter, Sort} from "../common/utils/array";
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
    <ion-list *ngIf="eventFull && filtered.length > 0">
        <ion-item-group *ngFor="#group of filtered">
            <ion-item-divider sticky>{{group.key}}</ion-item-divider>
            <ion-item *ngFor="#exponent of group.values" (click)="goToExponent(exponent)">
                <ion-avatar item-left><img [src]="exponent.logo"></ion-avatar>
                <h2>{{exponent.name}}</h2>
                <p class="nowrap lines2">{{exponent.description}}</p>
                <button clear item-right (click)="toggleFav(exponent);$event.stopPropagation();">
                    <ion-icon name="star" [hidden]="!isFav(exponent)"></ion-icon>
                    <ion-icon name="star-outline" [hidden]="isFav(exponent)"></ion-icon>
                </button>
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
    filtered: ItemGroup<ExponentFull>[] = [];
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

class ExponentListHelper {
    public static compute(items: ExponentFull[], q: string): ItemGroup<ExponentFull>[] {
        const filtered: ExponentFull[] = Filter.deep(items, q);
        const grouped: ItemGroup<ExponentFull>[] = ArrayHelper.groupBy(filtered, i => i.name[0].toUpperCase());
        return grouped.sort((e1, e2) => Sort.str(e1.key, e2.key));
    }
}
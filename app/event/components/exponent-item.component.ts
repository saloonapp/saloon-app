import {Component, Input} from "@angular/core";
import {ExponentItem} from "../models/Exponent";
import {EventData} from "../services/event.data";
import {RatingComponent} from "../../common/components/rating.component";

@Component({
    selector: 'exponent-item',
    directives: [RatingComponent],
    styles: [`
.item h2, .item p {
    white-space: initial;
}
    `],
    template: `
<ion-item>
    <!--<ion-avatar item-left><ion-img [src]="exponent.logo"></ion-img></ion-avatar>-->
    <ion-avatar item-left><img [src]="exponent.logo"></ion-avatar>
    <h2>{{exponent.name}} <rating *ngIf="getRating(exponent) > 0" [value]="getRating(exponent)"></rating></h2>
    <p class="nowrap lines2">{{exponent.description}}</p>
    <button clear item-right (click)="toggleFav(exponent);$event.stopPropagation();">
        <ion-icon name="star" [hidden]="!getFav(exponent)"></ion-icon>
        <ion-icon name="star-outline" [hidden]="getFav(exponent)"></ion-icon>
    </button>
</ion-item>
`
})
// TODO : <img> don't work well with virtualScroll & <ion-img> don't work well with ngFor :(
export class ExponentItemComponent {
    @Input() exponent: ExponentItem;
    constructor(private _eventData: EventData) {}

    getFav(exponent: ExponentItem): boolean { return this._eventData.getExponentFavorite(exponent); }
    toggleFav(exponent: ExponentItem) { this._eventData.toggleExponentFavorite(exponent); }
    getRating(exponent: ExponentItem): number { return this._eventData.getExponentRating(exponent); }
}

import {Component, Input} from "angular2/core";
import {AttendeeItem} from "../models/Attendee";
import {EventData} from "../services/event.data";
import {NotEmptyPipe, JoinPipe} from "../../common/pipes/array.pipe";

@Component({
    selector: 'attendee-item',
    pipes: [NotEmptyPipe, JoinPipe],
    styles: [`
.item h2, .item p {
    white-space: initial;
}
    `],
    template: `
<ion-item>
    <!--<ion-avatar item-left><ion-img [src]="attendee.avatar"></ion-img></ion-avatar>-->
    <ion-avatar item-left><img [src]="attendee.avatar"></ion-avatar>
    <h2>{{attendee.name}}</h2>
    <p>{{[attendee.job, attendee.company] | notEmpty | join:', '}}</p>
    <button clear item-right (click)="toggleFav(attendee);$event.stopPropagation();">
        <ion-icon name="star" [hidden]="!getFav(attendee)"></ion-icon>
        <ion-icon name="star-outline" [hidden]="getFav(attendee)"></ion-icon>
    </button>
</ion-item>
`
})
// TODO : <img> don't work well with virtualScroll & <ion-img> don't work well with ngFor :(
export class AttendeeItemComponent {
    @Input() attendee: AttendeeItem;
    constructor(private _eventData: EventData) {}

    getFav(attendee: AttendeeItem): boolean { return this._eventData.getAttendeeFavorite(attendee); }
    toggleFav(attendee: AttendeeItem) { this._eventData.toggleAttendeeFavorite(attendee); }
}

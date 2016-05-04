import {Component, Input} from "angular2/core";
import {EventItem} from "../models/Event";
import {DatePeriodPipe} from "../../common/pipes/datetime.pipe";

@Component({
    selector: 'event-item',
    pipes: [DatePeriodPipe],
    template: `
<ion-card *ngIf="format === 'card'">
    <img [src]="event.landing">
    <ion-card-content>
        <ion-card-title>{{event.name}}</ion-card-title>
        <h3>{{[event.start | datePeriod:event.end, event.address.city].filter(notEmpty).join(', ')}}</h3>
    </ion-card-content>
</ion-card>
<ion-item *ngIf="format !== 'card'">
    <ion-avatar item-left><img [src]="event.logo"></ion-avatar>
    <h2>{{event.name}}</h2>
    <p>{{[event.start | datePeriod:event.end, event.address.city].filter(notEmpty).join(', ')}}</p>
</ion-item>
`
})
export class EventItemComponent {
    @Input() event: EventItem;
    @Input() format: string;

    notEmpty(e: string): boolean {
        return e ? e.length > 0 : false;
    }
}
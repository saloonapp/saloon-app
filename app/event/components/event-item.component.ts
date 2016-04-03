import {Component, Input} from "angular2/core";
import {EventItem} from "../models/EventItem";
import {DatePeriodPipe} from "../../common/pipes/datetime.pipe";

@Component({
    selector: 'event-item',
    template: `
<ion-card>
    <img [src]="event.landing"/>
    <ion-card-content>
        <ion-card-title>{{event.name}}</ion-card-title>
        <h3>{{event.start | datePeriod:event.end}}, {{event.address.city}}</h3>
    </ion-card-content>
</ion-card>
`,
    pipes: [DatePeriodPipe]
})
export class EventItemComponent {
    @Input() event: EventItem
}
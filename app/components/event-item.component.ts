import {Component, Input} from "angular2/core";
import {EventItem} from "../models/EventItem";

@Component({
    selector: 'event-item',
    styles: [`
p {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}
    `],
    template: `
<ion-card>
    <img src="{{event.landingUrl}}"/>
    <ion-card-content>
        <ion-card-title>{{event.name}}</ion-card-title>
        <h3>{{event.start | date}}, {{event.address.city}}</h3>
        <p>{{event.description}}</p>
    </ion-card-content>
</ion-card>
`
})
export class EventItemComponent {
    @Input() event: EventItem
}
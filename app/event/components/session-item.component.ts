import {Component, Input} from "angular2/core";
import {SessionItem} from "../models/Session";
import {EventData} from "../services/event.data";
import {RatingComponent} from "../../common/components/rating.component";
import {TimePeriodPipe} from "../../common/pipes/datetime.pipe";
import {NotEmptyPipe, MapPipe, JoinPipe} from "../../common/pipes/array.pipe";

@Component({
    selector: 'session-item',
    directives: [RatingComponent],
    pipes: [TimePeriodPipe, NotEmptyPipe, MapPipe, JoinPipe],
    styles: [`
.item h2, .item p {
    white-space: initial;
}
    `],
    template: `
<ion-item>
    <h2>{{session.name}} <rating *ngIf="getRating(session) > 0" [value]="getRating(session)"></rating></h2>
    <p>{{[session.place, session.start | timePeriod:session.end] | notEmpty | join:' - '}}</p>
    <p>{{session.speakers | map:'name' | join:', '}}</p>
    <button clear item-right (click)="toggleFav(session);$event.stopPropagation();">
        <ion-icon name="star" [hidden]="!getFav(session)"></ion-icon>
        <ion-icon name="star-outline" [hidden]="getFav(session)"></ion-icon>
    </button>
</ion-item>
`
})
export class SessionItemComponent {
    @Input() session: SessionItem;
    constructor(private _eventData: EventData) {}

    getFav(session: SessionItem): boolean { return this._eventData.getSessionFavorite(session); }
    toggleFav(session: SessionItem) { this._eventData.toggleSessionFavorite(session); }
    getRating(session: SessionItem): number { return this._eventData.getSessionRating(session); }
}

import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {NavController, NavParams} from "ionic-angular/index";
import {AttendeeFull} from "./models/Attendee";
import {Sort} from "../common/utils/array";
import {EventData} from "./services/event.data";
import {RatingComponent} from "../common/components/rating.component";
import {CapitalizePipe} from "../common/pipes/text.pipe";
import {NotEmptyPipe, JoinPipe} from "../common/pipes/array.pipe";
import {AttendeePage} from "./attendee.page";

@Page({
    pipes: [CapitalizePipe, NotEmptyPipe, JoinPipe],
    directives: [RatingComponent],
    template: `
<ion-navbar *navbar>
    <ion-title>{{title | capitalize}}</ion-title>
</ion-navbar>
<ion-content>
    <div *ngIf="!filtered" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list-header *ngIf="filtered && filtered.length === 0">Pas de participant trouvé</ion-list-header>
    <ion-list *ngIf="filtered && filtered.length > 0" [virtualScroll]="filtered">
        <ion-item *virtualItem="#attendee" (click)="goToAttendee(attendee)">
            <ion-avatar item-left><ion-img [src]="attendee.avatar"></ion-img></ion-avatar>
            <h2>{{attendee.name}} <rating *ngIf="getRating(attendee) > 0" [value]="getRating(attendee)"></rating></h2>
            <p>{{[attendee.job, attendee.company] | notEmpty | join:', '}}</p>
            <button clear item-right (click)="toggleFav(attendee);$event.stopPropagation();">
                <ion-icon name="star" [hidden]="!getFav(attendee)"></ion-icon>
                <ion-icon name="star-outline" [hidden]="getFav(attendee)"></ion-icon>
            </button>
        </ion-item>
    </ion-list>
</ion-content>
`
})
export class AttendeeFilterPage implements OnInit {
    title: string;
    filtered: AttendeeFull[] = [];
    constructor(private _nav: NavController,
                private _navParams: NavParams,
                private _eventData: EventData) {}

    ngOnInit() {
        const filter = this._navParams.get('filter');
        this._eventData.getCurrentEventFull().then(eventFull => {
            [this.title, this.filtered] = this.compute(eventFull.attendees, filter);
        });
    }

    getFav(attendee: AttendeeFull): boolean { return this._eventData.getAttendeeFavorite(attendee); }
    toggleFav(attendee: AttendeeFull) { this._eventData.toggleAttendeeFavorite(attendee); }
    getRating(attendee: AttendeeFull): number { return this._eventData.getAttendeeRating(attendee); }

    goToAttendee(attendeeFull: AttendeeFull) {
        this._nav.push(AttendeePage, {
            attendeeItem: attendeeFull.toItem()
        });
    }

    private compute(items: AttendeeFull[], filter: any): [string, AttendeeFull[]] {
        if(filter.role)   { return [filter.role   , items.filter(i => Sort.str(i.role   , filter.role   ) === 0)]; }
        if(filter.company){ return [filter.company, items.filter(i => Sort.str(i.company, filter.company) === 0)]; }
        return ['Tous les participants', items];
    }
}

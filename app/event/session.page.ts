import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {NavController, NavParams} from "ionic-angular/index";
import {SessionItem, SessionFull} from "./models/Session";
import {AttendeeItem} from "./models/Attendee";
import {RatingComponent} from "../common/components/rating.component";
import {WeekDayPipe, TimePeriodPipe} from "../common/pipes/datetime.pipe";
import {CapitalizePipe} from "../common/pipes/text.pipe";
import {NotEmptyPipe, JoinPipe} from "../common/pipes/array.pipe";
import {EventData} from "./services/event.data";
import {SessionFilterPage} from "./session-filter.page";
import {AttendeePage} from "./attendee.page";
import {TwitterHandlePipe} from "../common/pipes/social.pipe";

@Page({
    pipes: [WeekDayPipe, CapitalizePipe, TimePeriodPipe, NotEmptyPipe, JoinPipe],
    directives: [RatingComponent],
    template: `
<ion-navbar *navbar>
    <ion-title>Session</ion-title>
    <ion-buttons end>
        <button (click)="toggleFav(sessionItem)">
            <ion-icon name="star" [hidden]="!isFav(sessionItem)"></ion-icon>
            <ion-icon name="star-outline" [hidden]="isFav(sessionItem)"></ion-icon>
        </button>
    </ion-buttons>
</ion-navbar>
<ion-content class="session-page">
    <div padding>
        <h1>{{sessionItem.name}}</h1>
        <div style="float: right; text-align: right; margin-top: -10px;">
            <p><a clear small twitter href="https://twitter.com/intent/tweet?text={{sessionItem.name}}{{speakerNames(sessionFull)}} %23DevoxxFR "><ion-icon name="logo-twitter"></ion-icon></a></p>
            <p><rating [value]="getRating(sessionItem)" (change)="setRating(sessionItem, $event)"></rating></p>
        </div>
        <p (click)="goToSlot(sessionItem)">{{sessionItem.start | weekDay | capitalize}}, {{sessionItem.start | timePeriod:sessionItem.end}}</p>
        <p (click)="goToPlace(sessionItem)">{{sessionItem.place}}</p>
        <p (click)="goToTheme(sessionItem)">{{sessionItem.theme}}</p>
        <p>{{sessionItem.description}}</p>
    </div>
    <ion-list *ngIf="sessionFull && sessionFull.speakers.length > 0">
        <ion-list-header>Speakers</ion-list-header>
        <ion-item *ngFor="#attendee of sessionFull.speakers" (click)="goToAttendee(attendee)">
            <ion-avatar item-left><img [src]="attendee.avatar"></ion-avatar>
            <h2>{{attendee.name}}</h2>
            <p>{{[attendee.job, attendee.company] | notEmpty | join:', '}}</p>
        </ion-item>
    </ion-list>
</ion-content>
`
})
export class SessionPage implements OnInit {
    sessionItem: SessionItem;
    sessionFull: SessionFull;
    constructor(private _nav: NavController,
                private _navParams: NavParams,
                private _eventData: EventData,
                private _twitterHandlePipe: TwitterHandlePipe) {}

    ngOnInit() {
        this.sessionItem = <SessionItem> this._navParams.get('sessionItem');
        this._eventData.getSessionFromCurrent(this.sessionItem.uuid).then(session => this.sessionFull = session);
    }

    isFav(session: SessionItem): boolean {
        return this._eventData.isFavoriteSession(session);
    }

    toggleFav(session: SessionItem) {
        this._eventData.toggleFavoriteSession(session);
    }

    getRating(session: SessionItem): number {
        return this._eventData.getSessionRating(session);
    }

    setRating(session: SessionItem, event) {
        this._eventData.setSessionRating(session, event.value);
    }

    speakerNames(session: SessionFull) {
        if(session && session.speakers.length > 0) {
            return ' par ' + session.speakers.map(s => {
                if(s.twitterUrl){
                    return this._twitterHandlePipe.transform(s.twitterUrl);
                } else {
                    return s.name;
                }
            }).filter(name => name && name.length > 0).join(' ');
        } else {
            return '';
        }
    }

    goToSlot(sessionItem: SessionItem) {
        this._nav.push(SessionFilterPage, {
            filter: { slot: sessionItem }
        });
    }

    goToPlace(sessionItem: SessionItem) {
        this._nav.push(SessionFilterPage, {
            filter: { place: sessionItem.place }
        });
    }

    goToTheme(sessionItem: SessionItem) {
        this._nav.push(SessionFilterPage, {
            filter: { theme: sessionItem.theme }
        });
    }

    goToAttendee(attendeeItem: AttendeeItem) {
        this._nav.push(AttendeePage, {
            attendeeItem: attendeeItem
        });
    }
}

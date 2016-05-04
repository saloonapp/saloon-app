import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {NavController, NavParams} from "ionic-angular/index";
import {SessionFull} from "./models/Session";
import {EventData} from "./services/event.data";
import {RatingComponent} from "../common/components/rating.component";
import {SessionItemComponent} from "./components/session-item.component";
import {WeekDayPipe, TimePeriodPipe} from "../common/pipes/datetime.pipe";
import {MapPipe, NotEmptyPipe, JoinPipe} from "../common/pipes/array.pipe";
import {CapitalizePipe} from "../common/pipes/text.pipe";
import {SessionPage} from "./session.page";

@Page({
    pipes: [TimePeriodPipe, MapPipe, NotEmptyPipe, JoinPipe, CapitalizePipe],
    directives: [RatingComponent, SessionItemComponent],
    styles: [`
.item h2, .item p {
    white-space: initial;
}
    `],
    template: `
<ion-navbar *navbar>
    <ion-title>{{title | capitalize}}</ion-title>
</ion-navbar>
<ion-content>
    <div *ngIf="!filtered" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list-header *ngIf="filtered && filtered.length === 0">Pas de session trouvée</ion-list-header>
    <ion-list *ngIf="filtered && filtered.length > 0" [virtualScroll]="filtered">
        <!--TODO : do not work.... :( <session-item *virtualItem="#session" [session]="session" (click)="goToSession(session)"></session-item>-->
        <ion-item *virtualItem="#session" (click)="goToSession(session)">
            <h2>{{session.name}} <rating *ngIf="getRating(session) > 0" [value]="getRating(session)"></rating></h2>
            <p>{{[session.place, session.start | timePeriod:session.end] | notEmpty | join:' - '}}</p>
            <p>{{session.speakers | map:'name' | join:', '}}</p>
            <button clear item-right (click)="toggleFav(session);$event.stopPropagation();">
                <ion-icon name="star" [hidden]="!getFav(session)"></ion-icon>
                <ion-icon name="star-outline" [hidden]="getFav(session)"></ion-icon>
            </button>
        </ion-item>
    </ion-list>
</ion-content>
`
})
export class SessionFilterPage implements OnInit {
    title: string;
    filtered: SessionFull[];
    constructor(private _nav: NavController,
                private _navParams: NavParams,
                private _eventData: EventData,
                private _weekDayPipe: WeekDayPipe,
                private _timePeriodPipe: TimePeriodPipe) {}

    ngOnInit() {
        const filter = this._navParams.get('filter');
        this._eventData.getCurrentEventFull().then(eventFull => {
            [this.title, this.filtered] = this.compute(eventFull.sessions, filter);
        });
    }

    getFav(sessionFull: SessionFull): boolean { return this._eventData.getSessionFavorite(sessionFull); }
    toggleFav(sessionFull: SessionFull) { this._eventData.toggleSessionFavorite(sessionFull); }
    getRating(session: SessionFull): number { return this._eventData.getSessionRating(session); }

    goToSession(sessionFull: SessionFull) {
        this._nav.push(SessionPage, {
            sessionItem: sessionFull.toItem()
        });
    }

    private compute(items: SessionFull[], filter: any): [string, SessionFull[]] {
        if(filter.slot){
            return [
                this._weekDayPipe.transform(filter.slot.start)+' '+this._timePeriodPipe.transform(filter.slot.start, [filter.slot.end]),
                items.filter(i => i.start === filter.slot.start && i.end === filter.slot.end)
            ];
        }
        if(filter.place){ return [filter.place, items.filter(i => i.place === filter.place)]; }
        if(filter.theme){ return [filter.theme, items.filter(i => i.theme === filter.theme)]; }
        return ['Toutes les sessions', items];
    }
}

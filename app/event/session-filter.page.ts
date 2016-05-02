import {OnInit} from "angular2/core";
import {Page} from "ionic-angular";
import {NavController, NavParams} from "ionic-angular/index";
import {SessionFull} from "./models/Session";
import {EventData} from "./services/event.data";
import {WeekDayPipe, TimePeriodPipe} from "../common/pipes/datetime.pipe";
import {MapPipe, NotEmptyPipe, JoinPipe} from "../common/pipes/array.pipe";
import {CapitalizePipe} from "../common/pipes/text.pipe";
import {SessionPage} from "./session.page";

@Page({
    pipes: [TimePeriodPipe, MapPipe, NotEmptyPipe, JoinPipe, CapitalizePipe],
    styles: [`
.item h2, .item p {
    white-space: initial;
}
    `],
    template: `
<ion-navbar *navbar>
    <ion-title>{{title | capitalize}}</ion-title>
</ion-navbar>
<ion-content class="session-list-page">
    <div *ngIf="!filtered" style="text-align: center; margin-top: 100px;"><ion-spinner></ion-spinner></div>
    <ion-list-header *ngIf="filtered && filtered.length === 0">Pas de session trouvée</ion-list-header>
    <ion-list *ngIf="filtered && filtered.length > 0">
        <ion-item *ngFor="#session of filtered" (click)="goToSession(session)">
            <h2>{{session.name}}</h2>
            <p>{{[session.place, session.category, session.start | timePeriod:session.end] | notEmpty | join:' - '}}</p>
            <p>{{session.speakers | map:'name' | join:', '}}</p>
            <button clear item-right (click)="toggleFav(session);$event.stopPropagation();">
                <ion-icon name="star" [hidden]="!isFav(session)"></ion-icon>
                <ion-icon name="star-outline" [hidden]="isFav(session)"></ion-icon>
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

    isFav(sessionFull: SessionFull) {
        return this._eventData.isFavoriteSession(sessionFull);
    }

    toggleFav(sessionFull: SessionFull) {
        if(this.isFav(sessionFull)){
            this._eventData.unfavoriteSession(sessionFull.toItem());
        } else {
            this._eventData.favoriteSession(sessionFull.toItem());
        }
    }

    goToSession(sessionFull: SessionFull) {
        this._nav.push(SessionPage, {
            sessionItem: sessionFull.toItem()
        });
    }

    compute(items: SessionFull[], filter: any): [string, SessionFull[]] {
        if(filter.slot){
            return [
                this._weekDayPipe.transform(filter.slot.start)+' '+this._timePeriodPipe.transform(filter.slot.start, [filter.slot.end]),
                items.filter(i => i.start === filter.slot.start && i.end === filter.slot.end)
            ];
        }
        if(filter.place){
            return [filter.place, items.filter(i => i.place === filter.place)];
        }
        if(filter.theme){
            return [filter.theme, items.filter(i => i.theme === filter.theme)];
        }
        return ['Toutes les sessions', items];
    }
}

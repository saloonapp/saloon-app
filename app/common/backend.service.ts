import {Injectable} from 'angular2/core';
import {Http, Response} from "angular2/http";
import {Observable} from "rxjs/Observable";
import "rxjs/Rx";
import * as _ from "lodash";
import {Address} from "./models/Address";
import {EventFull, EventElt} from "../event/models/EventFull";
import {EventItem} from "../event/models/EventItem";
import {AttendeeFull} from "../event/models/AttendeeFull";
import {AttendeeItem} from "../event/models/AttendeeItem";
import {SessionFull} from "../event/models/SessionFull";
import {SessionItem} from "../event/models/SessionItem";
import {ExponentFull} from "../event/models/ExponentFull";
import {ExponentItem} from "../event/models/ExponentItem";
import {Sort} from "./utils/array";
import {ObjectUtils} from "./utils/object";

@Injectable()
export class Backend {
    private _backendUrl = 'https://dev-saloon.herokuapp.com/api/v2';
    constructor(private _http: Http) {}

    getEvents(): Promise<EventItem[]> {
        return new Promise((resolve, reject) => {
            this._http.get(this._backendUrl+'/events/all')
                .map(res => res.json().map(this.formatEventItem))
                .do(data => console.log('Backend.getEvents', data))
                .catch(this.handleError)
                .subscribe(
                    events => resolve(events),
                    error => reject(error)
                );
        });
    }

    getEvent(uuid: string): Promise<EventFull> {
        return new Promise((resolve, reject) => {
            this._http.get(this._backendUrl+'/events/'+uuid+'/full')
                .map(res => this.formatEventFull(res.json()))
                .do(data => console.log('Backend.getEvent('+uuid+')', data))
                .catch(this.handleError)
                .subscribe(
                    events => resolve(events),
                    error => reject(error)
                );
        });
    }

    private formatEventItem(event: any): EventItem {
        return new EventItem(
            ObjectUtils.getSafe(event, 'uuid'),
            ObjectUtils.getSafe(event, 'name'),
            ObjectUtils.getSafe(event, 'description'),
            ObjectUtils.getSafe(event, 'descriptionHTML'),
            ObjectUtils.getSafe(event, 'images.logo'),
            ObjectUtils.getSafe(event, 'images.landing'),
            ObjectUtils.getSafe(event, 'info.website'),
            ObjectUtils.getSafe(event, 'info.start'),
            ObjectUtils.getSafe(event, 'info.end'),
            ObjectUtils.getSafe(event, 'info.address'),
            ObjectUtils.getSafe(event, 'info.price.label'),
            ObjectUtils.getSafe(event, 'info.price.url'),
            ObjectUtils.getSafe(event, 'info.social.twitter.hashtag'),
            ObjectUtils.getSafe(event, 'info.social.twitter.account'),
            ObjectUtils.getSafe(event, 'meta.categories'),
            ObjectUtils.getSafe(event, 'attendeeCount'),
            ObjectUtils.getSafe(event, 'sessionCount'),
            ObjectUtils.getSafe(event, 'exponentCount')
        );
    }
    private formatEventFull(event: any): EventFull {
        const attendeeItems = this.toMap(event.attendees.map(this.formatAttendeeItem), i => i.uuid);
        const attendeeFulls = event.attendees.map(s => this.formatAttendeeFull(s, event.sessions, event.exponents)).sort((e1, e2) => Sort.str(e1.lastName, e2.lastName));
        const sessionFulls = event.sessions.map(s => this.formatSessionFull(s, attendeeItems)).sort((e1, e2) => Sort.multi(Sort.num(e1.start, e2.start), Sort.num(e1.end, e2.end), Sort.str(e1.place, e2.place), Sort.str(e1.name, e2.name)));
        const exponentFulls = event.exponents.map(e => this.formatExponentFull(e, attendeeItems)).sort((e1, e2) => Sort.str(e1.name, e2.name));
        const formats = this.eltsToEventElt(sessionFulls.map(s => s.format));
        const themes = this.eltsToEventElt(sessionFulls.map(s => s.theme));
        const places = this.eltsToEventElt(sessionFulls.map(s => s.place));
        return new EventFull(
            ObjectUtils.getSafe(event, 'uuid'),
            ObjectUtils.getSafe(event, 'name'),
            ObjectUtils.getSafe(event, 'description'),
            ObjectUtils.getSafe(event, 'descriptionHTML'),
            ObjectUtils.getSafe(event, 'images.logo'),
            ObjectUtils.getSafe(event, 'images.landing'),
            ObjectUtils.getSafe(event, 'info.website'),
            ObjectUtils.getSafe(event, 'info.start'),
            ObjectUtils.getSafe(event, 'info.end'),
            ObjectUtils.getSafe(event, 'info.address'),
            ObjectUtils.getSafe(event, 'info.price.label'),
            ObjectUtils.getSafe(event, 'info.price.url'),
            ObjectUtils.getSafe(event, 'info.social.twitter.hashtag'),
            ObjectUtils.getSafe(event, 'info.social.twitter.account'),
            ObjectUtils.getSafe(event, 'meta.categories'),
            formats,
            themes,
            places,
            attendeeFulls,
            sessionFulls,
            exponentFulls
        );
    }
    private eltsToEventElt(elts: string[]): EventElt[] {
        return this.toMap(
            _.uniq(elts.map(e => e.trim()))
                .filter(e => e.length > 0)
                .sort(Sort.str)
                .map(e => new EventElt(e)),
            e => e.name
        );
    }
    private formatAttendeeItem(attendee: any): AttendeeItem {
        return new AttendeeItem(
            ObjectUtils.getSafe(attendee, 'uuid'),
            ObjectUtils.getSafe(attendee, 'info.role'),
            ObjectUtils.getSafe(attendee, 'name'),
            ObjectUtils.getSafe(attendee, 'description'),
            ObjectUtils.getSafe(attendee, 'descriptionHTML'),
            ObjectUtils.getSafe(attendee, 'images.avatar'),
            ObjectUtils.getSafe(attendee, 'info.job'),
            ObjectUtils.getSafe(attendee, 'info.company'),
            ObjectUtils.getSafe(attendee, 'info.website'),
            ObjectUtils.getSafe(attendee, 'social.twitterUrl')
        );
    }
    private formatAttendeeFull(attendee: any, sessions: any[], exponents: any[]): AttendeeFull {
        const attendeeSessions = sessions.filter(session => {
            return session.info ? session.info.speakers.indexOf(attendee.uuid) !== -1 : false;
        }).map(this.formatSessionItem);
        const attendeeExponents = exponents.filter(exponent => {
            return exponent.info ? exponent.info.team.indexOf(attendee.uuid) !== -1 : false;
        }).map(this.formatExponentItem);
        return new AttendeeFull(
            ObjectUtils.getSafe(attendee, 'uuid'),
            ObjectUtils.getSafe(attendee, 'info.role'),
            ObjectUtils.getSafe(attendee, 'name'),
            ObjectUtils.getSafe(attendee, 'info.firstName'),
            ObjectUtils.getSafe(attendee, 'info.lastName'),
            ObjectUtils.getSafe(attendee, 'description'),
            ObjectUtils.getSafe(attendee, 'descriptionHTML'),
            ObjectUtils.getSafe(attendee, 'images.avatar'),
            ObjectUtils.getSafe(attendee, 'info.email'),
            ObjectUtils.getSafe(attendee, 'info.phone'),
            ObjectUtils.getSafe(attendee, 'info.address'),
            ObjectUtils.getSafe(attendee, 'info.job'),
            ObjectUtils.getSafe(attendee, 'info.company'),
            ObjectUtils.getSafe(attendee, 'info.website'),
            ObjectUtils.getSafe(attendee, 'social.twitterUrl'),
            attendeeSessions,
            attendeeExponents
        );
    }
    private formatSessionItem(session: any): SessionItem {
        return new SessionItem(
            ObjectUtils.getSafe(session, 'uuid'),
            ObjectUtils.getSafe(session, 'name'),
            ObjectUtils.getSafe(session, 'description'),
            ObjectUtils.getSafe(session, 'descriptionHTML'),
            ObjectUtils.getSafe(session, 'images.landing'),
            ObjectUtils.getSafe(session, 'info.format'),
            ObjectUtils.getSafe(session, 'info.theme'),
            ObjectUtils.getSafe(session, 'info.place'),
            ObjectUtils.getSafe(session, 'info.start'),
            ObjectUtils.getSafe(session, 'info.end')
        );
    }
    private formatSessionFull(session: any, attendeeItems: { [key: string]: AttendeeItem; }): SessionFull {
        return new SessionFull(
            ObjectUtils.getSafe(session, 'uuid'),
            ObjectUtils.getSafe(session, 'name'),
            ObjectUtils.getSafe(session, 'description'),
            ObjectUtils.getSafe(session, 'descriptionHTML'),
            ObjectUtils.getSafe(session, 'images.landing'),
            ObjectUtils.getSafe(session, 'info.format'),
            ObjectUtils.getSafe(session, 'info.theme'),
            ObjectUtils.getSafe(session, 'info.place'),
            ObjectUtils.getSafe(session, 'info.start'),
            ObjectUtils.getSafe(session, 'info.end'),
            ObjectUtils.getSafe(session, 'info.speakers', []).map(attendeeId => attendeeItems[attendeeId])
        );
    }
    private formatExponentItem(exponent: any): ExponentItem {
        return new ExponentItem(
            ObjectUtils.getSafe(exponent, 'uuid'),
            ObjectUtils.getSafe(exponent, 'name'),
            ObjectUtils.getSafe(exponent, 'description'),
            ObjectUtils.getSafe(exponent, 'descriptionHTML'),
            ObjectUtils.getSafe(exponent, 'images.logo'),
            ObjectUtils.getSafe(exponent, 'images.landing'),
            ObjectUtils.getSafe(exponent, 'info.website'),
            ObjectUtils.getSafe(exponent, 'info.place')
        );
    }
    private formatExponentFull(exponent: any, attendeeItems: { [key: string]: AttendeeItem; }): ExponentFull {
        return new ExponentFull(
            ObjectUtils.getSafe(exponent, 'uuid'),
            ObjectUtils.getSafe(exponent, 'name'),
            ObjectUtils.getSafe(exponent, 'description'),
            ObjectUtils.getSafe(exponent, 'descriptionHTML'),
            ObjectUtils.getSafe(exponent, 'images.logo'),
            ObjectUtils.getSafe(exponent, 'images.landing'),
            ObjectUtils.getSafe(exponent, 'info.website'),
            ObjectUtils.getSafe(exponent, 'info.place'),
            ObjectUtils.getSafe(exponent, 'info.team', []).map(attendeeId => attendeeItems[attendeeId])
        );
    }

    private toMap(arr: any[], key: (any) => string): any {
        var res = {};
        arr.map(elt => {
            res[key(elt)] = elt;
        });
        return res;
    }

    private handleError(error: Response) {
        console.error('Backend error', error);
        return Observable.throw(error.json().error || 'Server error');
    }
}

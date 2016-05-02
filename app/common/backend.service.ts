import {Injectable} from 'angular2/core';
import {Http, Response} from "angular2/http";
import {Observable} from "rxjs/Observable";
import "rxjs/Rx";
import * as _ from "lodash";
import {Address} from "./models/Address";
import {EventItem, EventFull, EventElt} from "../event/models/Event";
import {AttendeeItem, AttendeeFull} from "../event/models/Attendee";
import {SessionItem, SessionFull} from "../event/models/Session";
import {ExponentItem, ExponentFull} from "../event/models/Exponent";
import {Slot, SlotHelper} from "../event/models/Slot";
import {ObjectHelper} from "./utils/object";
import {Sort} from "./utils/array";

@Injectable()
export class Backend {
    private _backendUrl = 'https://dev-saloon.herokuapp.com/api/v2';
    constructor(private _http: Http) {}

    getEvents(): Promise<EventItem[]> {
        return new Promise((resolve, reject) => {
            this._http.get(this._backendUrl+'/events/all')
                .map(res => res.json().map(this.formatEventItem))
                .do(data => console.log('Backend.getEvents', data))
                .retryWhen(errors => errors)// TODO : should improve to not retry indefinitely...
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
                .retryWhen(errors => errors)// TODO : should improve to not retry indefinitely...
                .catch(this.handleError)
                .subscribe(
                    events => resolve(events),
                    error => reject(error)
                );
        });
    }

    private formatEventItem(event: any): EventItem {
        return new EventItem(
            ObjectHelper.getSafe(event, 'uuid'),
            ObjectHelper.getSafe(event, 'name'),
            ObjectHelper.getSafe(event, 'description'),
            ObjectHelper.getSafe(event, 'descriptionHTML'),
            ObjectHelper.getSafe(event, 'images.logo'),
            ObjectHelper.getSafe(event, 'images.landing'),
            ObjectHelper.getSafe(event, 'info.website'),
            ObjectHelper.getSafe(event, 'info.start'),
            ObjectHelper.getSafe(event, 'info.end'),
            ObjectHelper.getSafe(event, 'info.address'),
            ObjectHelper.getSafe(event, 'info.price.label'),
            ObjectHelper.getSafe(event, 'info.price.url'),
            ObjectHelper.getSafe(event, 'info.social.twitter.hashtag'),
            ObjectHelper.getSafe(event, 'info.social.twitter.account'),
            ObjectHelper.getSafe(event, 'meta.categories'),
            ObjectHelper.getSafe(event, 'attendeeCount'),
            ObjectHelper.getSafe(event, 'sessionCount'),
            ObjectHelper.getSafe(event, 'exponentCount'),
            ObjectHelper.getSafe(event, 'meta.updated')
        );
    }
    private formatEventFull(event: any): EventFull {
        const attendeeItems = this.toMap(event.attendees.map(this.formatAttendeeItem), i => i.uuid);
        const attendeeFulls = event.attendees.map(s => this.formatAttendeeFull(s, event.sessions, event.exponents)).sort((e1, e2) => Sort.str(e1.lastName, e2.lastName));
        const sessionFulls = event.sessions.map(s => this.formatSessionFull(s, attendeeItems)).sort((e1, e2) => Sort.multi(Sort.num(e1.start, e2.start), Sort.num(e1.end, e2.end), Sort.str(e1.place, e2.place), Sort.str(e1.name, e2.name)));
        const exponentFulls = event.exponents.map(e => this.formatExponentFull(e, attendeeItems)).sort((e1, e2) => Sort.str(e1.name, e2.name));
        const slots: Slot[] = SlotHelper.extract(sessionFulls).map(s => s.toSlot()).sort((e1, e2) => Sort.multi(Sort.num(e1.start, e2.start), -Sort.num(e1.end, e2.end)));
        const formats = this.eltsToEventElt(sessionFulls.map(s => s.format));
        const themes = this.eltsToEventElt(sessionFulls.map(s => s.theme));
        const places = this.eltsToEventElt(sessionFulls.map(s => s.place));
        return new EventFull(
            ObjectHelper.getSafe(event, 'uuid'),
            ObjectHelper.getSafe(event, 'name'),
            ObjectHelper.getSafe(event, 'description'),
            ObjectHelper.getSafe(event, 'descriptionHTML'),
            ObjectHelper.getSafe(event, 'images.logo'),
            ObjectHelper.getSafe(event, 'images.landing'),
            ObjectHelper.getSafe(event, 'info.website'),
            ObjectHelper.getSafe(event, 'info.start'),
            ObjectHelper.getSafe(event, 'info.end'),
            ObjectHelper.getSafe(event, 'info.address'),
            ObjectHelper.getSafe(event, 'info.price.label'),
            ObjectHelper.getSafe(event, 'info.price.url'),
            ObjectHelper.getSafe(event, 'info.social.twitter.hashtag'),
            ObjectHelper.getSafe(event, 'info.social.twitter.account'),
            ObjectHelper.getSafe(event, 'meta.categories'),
            formats,
            themes,
            places,
            attendeeFulls,
            sessionFulls,
            exponentFulls,
            slots,
            ObjectHelper.getSafe(event, 'meta.updated')
        );
    }
    private eltsToEventElt(elts: string[]): EventElt[] {
        return _.uniq(elts.map(e => e.trim()))
                .filter(e => e.length > 0)
                .sort(Sort.str)
                .map(e => new EventElt(e));
    }
    private formatAttendeeItem(attendee: any): AttendeeItem {
        return new AttendeeItem(
            ObjectHelper.getSafe(attendee, 'uuid'),
            ObjectHelper.getSafe(attendee, 'info.role'),
            ObjectHelper.getSafe(attendee, 'name'),
            ObjectHelper.getSafe(attendee, 'description'),
            ObjectHelper.getSafe(attendee, 'descriptionHTML'),
            ObjectHelper.getSafe(attendee, 'images.avatar'),
            ObjectHelper.getSafe(attendee, 'info.job'),
            ObjectHelper.getSafe(attendee, 'info.company'),
            ObjectHelper.getSafe(attendee, 'info.website'),
            ObjectHelper.getSafe(attendee, 'social.twitterUrl'),
            ObjectHelper.getSafe(attendee, 'meta.updated')
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
            ObjectHelper.getSafe(attendee, 'uuid'),
            ObjectHelper.getSafe(attendee, 'info.role'),
            ObjectHelper.getSafe(attendee, 'name'),
            ObjectHelper.getSafe(attendee, 'info.firstName'),
            ObjectHelper.getSafe(attendee, 'info.lastName'),
            ObjectHelper.getSafe(attendee, 'description'),
            ObjectHelper.getSafe(attendee, 'descriptionHTML'),
            ObjectHelper.getSafe(attendee, 'images.avatar'),
            ObjectHelper.getSafe(attendee, 'info.email'),
            ObjectHelper.getSafe(attendee, 'info.phone'),
            ObjectHelper.getSafe(attendee, 'info.address'),
            ObjectHelper.getSafe(attendee, 'info.job'),
            ObjectHelper.getSafe(attendee, 'info.company'),
            ObjectHelper.getSafe(attendee, 'info.website'),
            ObjectHelper.getSafe(attendee, 'social.twitterUrl'),
            attendeeSessions,
            attendeeExponents,
            ObjectHelper.getSafe(attendee, 'meta.updated')
        );
    }
    private formatSessionItem(session: any): SessionItem {
        return new SessionItem(
            ObjectHelper.getSafe(session, 'uuid'),
            ObjectHelper.getSafe(session, 'name'),
            ObjectHelper.getSafe(session, 'description'),
            ObjectHelper.getSafe(session, 'descriptionHTML'),
            ObjectHelper.getSafe(session, 'images.landing'),
            ObjectHelper.getSafe(session, 'info.format'),
            ObjectHelper.getSafe(session, 'info.theme'),
            ObjectHelper.getSafe(session, 'info.place'),
            ObjectHelper.getSafe(session, 'info.start'),
            ObjectHelper.getSafe(session, 'info.end'),
            ObjectHelper.getSafe(session, 'meta.updated')
        );
    }
    private formatSessionFull(session: any, attendeeItems: { [key: string]: AttendeeItem; }): SessionFull {
        return new SessionFull(
            ObjectHelper.getSafe(session, 'uuid'),
            ObjectHelper.getSafe(session, 'name'),
            ObjectHelper.getSafe(session, 'description'),
            ObjectHelper.getSafe(session, 'descriptionHTML'),
            ObjectHelper.getSafe(session, 'images.landing'),
            ObjectHelper.getSafe(session, 'info.format'),
            ObjectHelper.getSafe(session, 'info.theme'),
            ObjectHelper.getSafe(session, 'info.place'),
            ObjectHelper.getSafe(session, 'info.start'),
            ObjectHelper.getSafe(session, 'info.end'),
            ObjectHelper.getSafe(session, 'info.speakers', []).map(attendeeId => attendeeItems[attendeeId]),
            ObjectHelper.getSafe(session, 'meta.updated')
        );
    }
    private formatExponentItem(exponent: any): ExponentItem {
        return new ExponentItem(
            ObjectHelper.getSafe(exponent, 'uuid'),
            ObjectHelper.getSafe(exponent, 'name'),
            ObjectHelper.getSafe(exponent, 'description'),
            ObjectHelper.getSafe(exponent, 'descriptionHTML'),
            ObjectHelper.getSafe(exponent, 'images.logo'),
            ObjectHelper.getSafe(exponent, 'images.landing'),
            ObjectHelper.getSafe(exponent, 'info.website'),
            ObjectHelper.getSafe(exponent, 'info.place'),
            ObjectHelper.getSafe(exponent, 'meta.updated')
        );
    }
    private formatExponentFull(exponent: any, attendeeItems: { [key: string]: AttendeeItem; }): ExponentFull {
        return new ExponentFull(
            ObjectHelper.getSafe(exponent, 'uuid'),
            ObjectHelper.getSafe(exponent, 'name'),
            ObjectHelper.getSafe(exponent, 'description'),
            ObjectHelper.getSafe(exponent, 'descriptionHTML'),
            ObjectHelper.getSafe(exponent, 'images.logo'),
            ObjectHelper.getSafe(exponent, 'images.landing'),
            ObjectHelper.getSafe(exponent, 'info.website'),
            ObjectHelper.getSafe(exponent, 'info.place'),
            ObjectHelper.getSafe(exponent, 'info.team', []).map(attendeeId => attendeeItems[attendeeId]),
            ObjectHelper.getSafe(exponent, 'meta.updated')
        );
    }

    private toMap<T>(arr: T[], key: (T) => string): { [key: string]: T; } {
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

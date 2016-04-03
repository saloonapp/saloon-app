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
            event.uuid,
            event.name,
            event.description,
            event.descriptionHTML,
            event.images ? event.images.logo : null,
            event.images ? event.images.landing : null,
            event.info ? event.info.website : null,
            event.info ? event.info.start : null,
            event.info ? event.info.end : null,
            event.info ? event.info.address : new Address(null, null, null, null),
            event.info ? event.info.price ? event.info.price.label : null : null,
            event.info ? event.info.price ? event.info.price.url : null : null,
            event.info ? event.info.social ? event.info.social.twitter ? event.info.social.twitter.hashtag : null : null : null,
            event.info ? event.info.social ? event.info.social.twitter ? event.info.social.twitter.account : null : null : null,
            event.meta ? event.meta.categories : null,
            event.attendeeCount,
            event.sessionCount,
            event.exponentCount);
    }
    private formatEventFull(event: any): EventFull {
        let attendeeItems = this.toMap(event.attendees.map(this.formatAttendeeItem), i => i.uuid);
        let attendeeFulls = event.attendees.map(s => this.formatAttendeeFull(s, event.sessions, event.exponents)).sort((e1, e2) => Sort.str(e1.lastName.toLowerCase(), e2.lastName.toLowerCase()));
        let sessionFulls = event.sessions.map(s => this.formatSessionFull(s, attendeeItems)).sort((e1, e2) => Sort.multi(Sort.num(e1.start, e2.start), Sort.num(e1.end, e2.end), Sort.str(e1.place.toLowerCase(), e2.place.toLowerCase()), Sort.str(e1.name.toLowerCase(), e2.name.toLowerCase())));
        let exponentFulls = event.exponents.map(e => this.formatExponentFull(e, attendeeItems)).sort((e1, e2) => Sort.str(e1.name.toLowerCase(), e2.name.toLowerCase()));
        let formats = this.eltsToEventElt(sessionFulls.map(s => s.format));
        let themes = this.eltsToEventElt(sessionFulls.map(s => s.theme));
        let places = this.eltsToEventElt(sessionFulls.map(s => s.place));
        return new EventFull(
            event.uuid,
            event.name,
            event.description,
            event.descriptionHTML,
            event.images ? event.images.logo : null,
            event.images ? event.images.landing : null,
            event.info ? event.info.website : null,
            event.info ? event.info.start : null,
            event.info ? event.info.end : null,
            event.info ? event.info.address : null,
            event.info ? event.info.price ? event.info.price.label : null : null,
            event.info ? event.info.price ? event.info.price.url : null : null,
            event.info ? event.info.social ? event.info.social.twitter ? event.info.social.twitter.hashtag : null : null : null,
            event.info ? event.info.social ? event.info.social.twitter ? event.info.social.twitter.account : null : null : null,
            event.meta ? event.meta.categories : null,
            formats,
            themes,
            places,
            attendeeFulls,
            sessionFulls,
            exponentFulls);
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
            attendee.uuid,
            attendee.info ? attendee.info.role : null,
            attendee.name,
            attendee.description,
            attendee.descriptionHTML,
            attendee.images ? attendee.images.avatar : null,
            attendee.info ? attendee.info.job : null,
            attendee.info ? attendee.info.company : null,
            attendee.info ? attendee.info.website : null,
            attendee.social ? attendee.social.twitterUrl : null);
    }
    private formatAttendeeFull(attendee: any, sessions: any[], exponents: any[]): AttendeeFull {
        let attendeeSessions = sessions.filter(session => {
            return session.info ? session.info.speakers.indexOf(attendee.uuid) !== -1 : false;
        }).map(this.formatSessionItem);
        let attendeeExponents = exponents.filter(exponent => {
            return exponent.info ? exponent.info.team.indexOf(attendee.uuid) !== -1 : false;
        }).map(this.formatExponentItem);
        return new AttendeeFull(
            attendee.uuid,
            attendee.info ? attendee.info.role : null,
            attendee.name,
            attendee.info ? attendee.info.firstName : null,
            attendee.info ? attendee.info.lastName : null,
            attendee.description,
            attendee.descriptionHTML,
            attendee.images ? attendee.images.avatar : null,
            attendee.info ? attendee.info.email : null,
            attendee.info ? attendee.info.phone : null,
            attendee.info ? attendee.info.address : null,
            attendee.info ? attendee.info.job : null,
            attendee.info ? attendee.info.company : null,
            attendee.info ? attendee.info.website : null,
            attendee.social ? attendee.social.twitterUrl : null,
            attendeeSessions,
            attendeeExponents
        );
    }
    private formatSessionItem(session: any): SessionItem {
        return new SessionItem(
            session.uuid,
            session.name,
            session.description,
            session.descriptionHTML,
            session.images ? session.images.landing : null,
            session.info ? session.info.format : null,
            session.info ? session.info.theme : null,
            session.info ? session.info.place : null,
            session.info ? session.info.start : null,
            session.info ? session.info.end : null
        );
    }
    private formatSessionFull(session: any, attendeeItems: { [key: string]: AttendeeItem; }): SessionFull {
        return new SessionFull(
            session.uuid,
            session.name,
            session.description,
            session.descriptionHTML,
            session.images ? session.images.landing : null,
            session.info ? session.info.format : null,
            session.info ? session.info.theme : null,
            session.info ? session.info.place : null,
            session.info ? session.info.start : null,
            session.info ? session.info.end : null,
            session.info ? session.info.speakers.map(attendeeId => attendeeItems[attendeeId]) : []
        );
    }
    private formatExponentItem(exponent: any): ExponentItem {
        return new ExponentItem(
            exponent.uuid,
            exponent.name,
            exponent.description,
            exponent.descriptionHTML,
            exponent.images ? exponent.images.logo : null,
            exponent.images ? exponent.images.landing : null,
            exponent.info ? exponent.info.website : null,
            exponent.info ? exponent.info.place : null
        );
    }
    private formatExponentFull(exponent: any, attendeeItems: { [key: string]: AttendeeItem; }): ExponentFull {
        return new ExponentFull(
            exponent.uuid,
            exponent.name,
            exponent.description,
            exponent.descriptionHTML,
            exponent.images ? exponent.images.logo : null,
            exponent.images ? exponent.images.landing : null,
            exponent.info ? exponent.info.website : null,
            exponent.info ? exponent.info.place : null,
            exponent.info ? exponent.info.team.map(attendeeId => attendeeItems[attendeeId]) : []
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

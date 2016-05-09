import {Injectable} from 'angular2/core';
import {Http, Response} from "angular2/http";
import {Observable} from "rxjs/Observable";
import "rxjs/Rx";
import * as _ from "lodash";
import {Config} from "../config";
import {Address} from "./models/Address";
import {EventList, EventItem, EventFull, EventElt} from "../event/models/Event";
import {AttendeeItem, AttendeeFull} from "../event/models/Attendee";
import {SessionItem, SessionFull} from "../event/models/Session";
import {ExponentItem, ExponentFull} from "../event/models/Exponent";
import {Slot, SlotHelper} from "../event/models/Slot";
import {ObjectHelper} from "./utils/object";
import {Sort} from "./utils/array";
import {DateHelper} from "./utils/date";

@Injectable()
export class Backend {
    constructor(private _http: Http) {}

    getEvents(): Promise<EventList> {
        return new Promise((resolve, reject) => {
            this._http.get(Config.backendUrl+'/events/all')
                .map(res => BackendFormatter.formatEventList(res.json()))
                .do(data => console.log('Backend.getEvents', data))
                .retryWhen(errors => errors)// TODO : should improve to not retry indefinitely...
                .catch(this.handleError)
                .subscribe(
                    eventList => resolve(eventList),
                    error => reject(error)
                );
        });
    }

    getEvent(uuid: string): Promise<EventFull> {
        return new Promise((resolve, reject) => {
            this._http.get(Config.backendUrl+'/events/'+uuid+'/full')
                .map(res => BackendFormatter.formatEventFull(res.json()))
                .do(data => console.log('Backend.getEvent('+uuid+')', data))
                .retryWhen(errors => errors)// TODO : should improve to not retry indefinitely...
                .catch(this.handleError)
                .subscribe(
                    events => resolve(events),
                    error => reject(error)
                );
        });
    }

    private handleError(error: Response) {
        console.error('Backend error', error);
        return Observable.throw(error.json().error || 'Server error');
    }
}

class BackendFormatter {
    public static formatEventList(events: any[]): EventList {
        return new EventList(
            events.map(this.formatEventItem),
            DateHelper.now()
        );
    }
    public static formatEventFull(event: any): EventFull {
        const attendeeItems : { [key: string]: AttendeeItem; } = this.toMap<AttendeeItem>(event.attendees.map(this.formatAttendeeItem), i => i.uuid);
        const attendeeFulls : AttendeeFull[]                   = event.attendees.map(s => this.formatAttendeeFull(s, event.sessions, event.exponents)).sort((e1, e2) => Sort.str(e1.lastName, e2.lastName));
        const sessionFulls  : SessionFull[]                    = event.sessions.map(s => this.formatSessionFull(s, attendeeItems)).sort((e1, e2) => Sort.multi(Sort.num(e1.start, e2.start), Sort.num(e1.end, e2.end), Sort.str(e1.place, e2.place), Sort.str(e1.name, e2.name)));
        const exponentFulls : ExponentFull[]                   = event.exponents.map(e => this.formatExponentFull(e, attendeeItems)).sort((e1, e2) => Sort.str(e1.name, e2.name));
        const slots         : Slot[]                           = SlotHelper.extract(sessionFulls).map(s => s.toSlot()).sort((e1, e2) => Sort.multi(Sort.num(e1.start, e2.start), -Sort.num(e1.end, e2.end)));
        const formats       : EventElt[]                       = this.eltsToEventElt(sessionFulls.map(s => s.format));
        const themes        : EventElt[]                       = this.eltsToEventElt(sessionFulls.map(s => s.theme));
        const places        : EventElt[]                       = this.eltsToEventElt(sessionFulls.map(s => s.place));
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
            ObjectHelper.getSafe(event, 'meta.updated'),
            DateHelper.now()
        );
    }

    private static formatEventItem(event: any): EventItem {
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
            ObjectHelper.getSafe(event, 'meta.updated'),
            DateHelper.now()
        );
    }
    private static formatAttendeeItem(attendee: any): AttendeeItem {
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
    private static formatAttendeeFull(attendee: any, sessions: any[], exponents: any[]): AttendeeFull {
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
    private static formatSessionItem(session: any): SessionItem {
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
    private static formatSessionFull(session: any, attendeeItems: { [key: string]: AttendeeItem; }): SessionFull {
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
    private static formatExponentItem(exponent: any): ExponentItem {
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
    private static formatExponentFull(exponent: any, attendeeItems: { [key: string]: AttendeeItem; }): ExponentFull {
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
    private static eltsToEventElt(elts: string[]): EventElt[] {
        return _.uniq(elts.map(e => e.trim()))
            .filter(e => e.length > 0)
            .sort(Sort.str)
            .map(e => new EventElt(e));
    }

    private static toMap<T>(arr: T[], key: (T) => string): { [key: string]: T; } {
        var res: { [key: string]: T; } = {};
        arr.map(elt => {
            res[key(elt)] = elt;
        });
        return res;
    }
}

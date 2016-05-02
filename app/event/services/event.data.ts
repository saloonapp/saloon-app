import {Injectable} from "angular2/core";
import {EventItem, EventFull} from "../models/Event";
import {AttendeeItem, AttendeeFull} from "../models/Attendee";
import {SessionItem, SessionFull} from "../models/Session";
import {ExponentItem, ExponentFull} from "../models/Exponent";
import {UserAction} from "../../user/models/UserAction";
import {Storage} from "../../common/storage.service";
import {EventService} from "./event.service";

@Injectable()
export class EventData {
    private currentEventItem: EventItem;
    private currentEventFull: Promise<EventFull>;
    private favorites: {[key: string]: {[key: string]: boolean}} = null;
    constructor(private _storage: Storage,
                private _eventService: EventService) {}

    setCurrentEvent(eventItem: EventItem): void {
        this.setEvent(eventItem, this._eventService.getEvent(eventItem.uuid));
    }
    updateCurrentEvent(eventItem: EventItem, eventFull: EventFull): void {
        this.setEvent(eventItem, Promise.resolve(eventFull));
    }

    getCurrentEventItem(): EventItem {
        return this.currentEventItem;
    }
    getCurrentEventFull(): Promise<EventFull> {
        return this.currentEventFull;
    }
    getAttendeeFromCurrent(uuid: string): Promise<AttendeeFull> {
        return this.currentEventFull.then(event => event.attendees.find(e => e.uuid === uuid));
    }
    getSessionFromCurrent(uuid: string): Promise<SessionFull> {
        return this.currentEventFull.then(event => event.sessions.find(e => e.uuid === uuid));
    }
    getExponentFromCurrent(uuid: string): Promise<ExponentFull> {
        return this.currentEventFull.then(event => event.exponents.find(e => e.uuid === uuid));
    }

    isFavoriteSession(session: SessionItem): boolean { return this.isFavorite('session', session.uuid); }
    hasFavoriteSessions(): boolean { return this.hasFavorites('session'); }
    favoriteSession(session: SessionItem): Promise<void> { return this.favorite('session', session.uuid); }
    unfavoriteSession(session: SessionItem): Promise<void> { return this.unfavorite('session', session.uuid); }
    toggleFavoriteSession(session: SessionItem): Promise<void> { return this.toggleFavorite('session', session.uuid); }

    isFavoriteAttendee(attendee: AttendeeItem): boolean { return this.isFavorite('attendee', attendee.uuid); }
    hasFavoriteAttendees(): boolean { return this.hasFavorites('attendee'); }
    favoriteAttendee(attendee: AttendeeItem): Promise<void> { return this.favorite('attendee', attendee.uuid); }
    unfavoriteAttendee(attendee: AttendeeItem): Promise<void> { return this.unfavorite('attendee', attendee.uuid); }
    toggleFavoriteAttendee(attendee: AttendeeItem): Promise<void> { return this.toggleFavorite('attendee', attendee.uuid); }

    isFavoriteExponent(exponent: ExponentItem): boolean { return this.isFavorite('exponent', exponent.uuid); }
    hasFavoriteExponents(): boolean { return this.hasFavorites('exponent'); }
    favoriteExponent(exponent: ExponentItem): Promise<void> { return this.favorite('exponent', exponent.uuid); }
    unfavoriteExponent(exponent: ExponentItem): Promise<void> { return this.unfavorite('exponent', exponent.uuid); }
    toggleFavoriteExponent(exponent: ExponentItem): Promise<void> { return this.toggleFavorite('exponent', exponent.uuid); }

    private isFavorite(type: string, uuid: string): boolean {
        return this.favorites && this.favorites[type] ? this.favorites[type][uuid] || false : false;
    }
    private hasFavorites(type: string): boolean {
        return this.favorites && this.favorites[type] ? Object.keys(this.favorites[type]).length > 0 : false;
    }
    private favorite(type: string, uuid: string): Promise<void> {
        const eventId = this.currentEventItem.uuid;
        return this._storage.getUserActions(eventId).then(actions => {
            const isFav = actions.find(a => a.isFavorite(type, uuid));
            if(!isFav){
                actions.push(UserAction.favorite(eventId, type, uuid));
            }
            return this._storage.setUserActions(eventId, actions);
        }).then(() => {
            if(this.favorites && this.favorites[type]){ this.favorites[type][uuid] = true; }
        });
    }
    private unfavorite(type: string, uuid: string): Promise<void> {
        const eventId = this.currentEventItem.uuid;
        return this._storage.getUserActions(eventId).then(actions => {
            return this._storage.setUserActions(eventId, actions.filter(a => !a.isFavorite(type, uuid)));
        }).then(() => {
            if(this.favorites && this.favorites[type]){ this.favorites[type][uuid] = false; }
        });
    }
    private toggleFavorite(type: string, uuid: string): Promise<void> {
        if(this.isFavorite(type, uuid)){
            return this.unfavorite(type, uuid);
        } else {
            return this.favorite(type, uuid);
        }
    }

    private setEvent(eventItem: EventItem, eventFullPromise: Promise<EventFull>): void {
        this.currentEventItem = eventItem;
        this.currentEventFull = eventFullPromise;
        this.favorites = null;
        this._storage.getUserActions(eventItem.uuid).then(actions => {
            // all favorite types should be initialized to correctly be updated in UI (for the first time)
            const favorites: {[key: string]: {[key: string]: boolean}} = {session: {}, attendee: {}, exponent: {}};
            actions.filter(a => a.action === 'favorite').map(action => {
                if(!favorites[action.itemType]){ favorites[action.itemType] = {}; }
                favorites[action.itemType][action.itemId] = true;
            });
            this.favorites = favorites;
        });
    }
}

import {Injectable} from "angular2/core";
import {EventFull} from "../models/EventFull";
import {EventItem} from "../models/EventItem";
import {AttendeeFull} from "../models/AttendeeFull";
import {SessionFull} from "../models/SessionFull";
import {SessionItem} from "../models/SessionItem";
import {ExponentFull} from "../models/ExponentFull";
import {UserAction} from "../../user/models/UserAction";
import {Storage} from "../../common/storage.service";
import {EventService} from "./event.service";

@Injectable()
export class EventData {
    private currentEventItem: EventItem;
    private currentEventFull: Promise<EventFull>;
    private favorites: { [key: string]: boolean; } = null;
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

    isFavoriteSession(session: SessionItem): boolean {
        return this.favorites ? this.favorites[session.uuid] || false : false;
    }
    hasFavoriteSessions(): boolean {
        return this.favorites ? Object.keys(this.favorites).length > 0 : false;
    }
    favoriteSession(session: SessionItem): Promise<void> {
        const eventId = this.currentEventItem.uuid;
        return this._storage.getUserActions(eventId).then(actions => {
            const isFav = actions.find(a => UserAction.isFavoriteSession(a, session));
            if(!isFav){
                actions.push(UserAction.favoriteSession(eventId, session));
            }
            return this._storage.setUserActions(eventId, actions);
        }).then(() => {
            this.favorites[session.uuid] = true;
        });
    }
    unfavoriteSession(session: SessionItem): Promise<void> {
        const eventId = this.currentEventItem.uuid;
        return this._storage.getUserActions(eventId).then(actions => {
            return this._storage.setUserActions(eventId, actions.filter(a => !UserAction.isFavoriteSession(a, session)));
        }).then(() => {
            this.favorites[session.uuid] = false;
        });
    }

    private setEvent(eventItem: EventItem, eventFullPromise: Promise<EventFull>): void {
        this.currentEventItem = eventItem;
        this.currentEventFull = eventFullPromise;
        this.favorites = null;
        this._storage.getUserActions(eventItem.uuid).then(actions => {
            let favorites: { [key: string]: boolean; } = {};
            actions.filter(a => a.action === 'favorite' && a.itemType === 'session').map(action => {
                favorites[action.itemId] = true;
            });
            this.favorites = favorites;
        });
    }
}

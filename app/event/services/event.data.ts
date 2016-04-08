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
    constructor(private _storage: Storage, private _eventService: EventService) {}

    setCurrentEvent(event: EventItem): void {
        this.currentEventItem = event;
        this.currentEventFull = this._eventService.getEvent(event.uuid);
        this.favorites = null;
    }
    updateCurrentEvent(eventItem: EventItem, eventFull: EventFull): void {
        this.currentEventItem = eventItem;
        this.currentEventFull = Promise.resolve(eventFull);
        this.favorites = null;
    }
    getCurrentEventItem(): EventItem {
        return this.currentEventItem;
    }
    getCurrentEventFull(): Promise<EventFull> {
        return this.currentEventFull;
    }
    getAttendeeFromCurrent(uuid: string): Promise<AttendeeFull> {
        return this.currentEventFull.then(event => {
            return event.attendees.find(e => e.uuid === uuid)
        });
    }
    getSessionFromCurrent(uuid: string): Promise<SessionFull> {
        return this.currentEventFull.then(event => {
            return event.sessions.find(e => e.uuid === uuid)
        });
    }
    getExponentFromCurrent(uuid: string): Promise<ExponentFull> {
        return this.currentEventFull.then(event => {
            return event.exponents.find(e => e.uuid === uuid)
        });
    }

    getFavoriteSessions(): Promise<{ [key: string]: boolean; }> {
        if(this.favorites === null) {
            return this._storage.getUserActions(this.currentEventItem.uuid).then(actions => {
                let favorites: { [key: string]: boolean; } = {};
                actions.filter(a => a.action === 'favorite' && a.itemType === 'session').map(action => {
                    favorites[action.itemId] = true;
                });
                this.favorites = favorites;
                return this.favorites;
            });
        } else {
            return Promise.resolve(this.favorites);
        }
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
}

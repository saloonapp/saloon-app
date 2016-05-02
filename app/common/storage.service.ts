import {Injectable} from "angular2/core";
import {StorageUtils} from "./services/storage-utils.service";
import {EventItem, EventFull} from "../event/models/Event";
import {UserAction} from "../user/models/UserAction";

@Injectable()
export class Storage {
    constructor(private _storage: StorageUtils) {}

    getEvents(): Promise<EventItem[]> {
        return this._storage.get('events', []).then(array => array.map(item => EventItem.fromJS(item)));
    }

    setEvents(events: EventItem[]): Promise<void> {
        return this._storage.set('events', events);
    }

    getEvent(uuid: string): Promise<EventFull> {
        return this._storage.get('event-'+uuid).then(item => item ? EventFull.fromJS(item) : item);
    }

    setEvent(event: EventFull): Promise<void> {
        return this._storage.set('event-'+event.uuid, event);
    }

    getUserActions(eventId: string): Promise<UserAction[]> {
        return this._storage.get('actions-'+eventId, []).then(array => array.map(item => UserAction.fromJS(item)));
    }

    setUserActions(eventId: string, actions: UserAction[]): Promise<void> {
        return this._storage.set('actions-'+eventId, actions);
    }

    clear(): Promise<void> {
        return this._storage.clear();
    }
}

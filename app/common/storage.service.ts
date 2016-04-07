import {Injectable} from "angular2/core";
import {StorageUtils} from "./services/storage-utils.service";
import {EventItem} from "../event/models/EventItem";
import {EventFull} from "../event/models/EventFull";
import {UserAction} from "../user/models/UserAction";

@Injectable()
export class Storage {
    constructor(private _storage: StorageUtils) {}

    getEvents(): Promise<EventItem[]> {
        return this._storage.get('events', []);
    }

    setEvents(events: EventItem[]): Promise<void> {
        return this._storage.set('events', events);
    }

    getEvent(uuid: string): Promise<EventFull> {
        return this._storage.get('event-'+uuid);
    }

    setEvent(event: EventFull): Promise<void> {
        return this._storage.set('event-'+event.uuid, event);
    }

    getUserActions(eventId: string): Promise<UserAction[]> {
        return this._storage.get('actions-'+eventId, []);
    }

    setUserActions(eventId: string, actions: UserAction[]): Promise<void> {
        return this._storage.set('actions-'+eventId, actions);
    }

    clear(): Promise<void> {
        return this._storage.clear();
    }
}

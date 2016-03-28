import {Injectable} from "angular2/core";
import {StorageUtils} from "./storage-utils.service";
import {EventItem} from "../models/EventItem";
import {EventFull} from "../models/EventFull";

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

    clear(): Promise<void> {
        return this._storage.clear();
    }
}

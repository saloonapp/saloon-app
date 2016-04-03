import {Injectable} from "angular2/core";
import {StorageUtils} from "./services/storage-utils.service";
import {EventItem} from "../event/models/EventItem";
import {EventFull} from "../event/models/EventFull";

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

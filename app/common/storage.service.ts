import {Injectable} from "angular2/core";
import {StorageUtils} from "./storage-utils.service";
import {EventItem} from "../models/EventItem";

@Injectable()
export class Storage {
    constructor(private _storage: StorageUtils) {}

    getEvents(): Promise<EventItem[]> {
        return this._storage.get('events', []);
    }
    setEvents(events: EventItem[]): Promise<void> {
        return this._storage.set('events', events);
    }
    getEvent(uuid: string): Promise<Event> {
        return this._storage.get('event-'+uuid);
    }
    setEvent(event: Event): Promise<void> {
        return this._storage.set('event-'+event.uuid, event);
    }
}

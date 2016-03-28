import {Injectable} from "angular2/core";
import {EventItem} from "../models/EventItem";
import {EventFull} from "../models/EventFull";
import {Storage} from "./storage.service";
import {Backend} from "./backend.service";

@Injectable()
export class EventService {
    constructor(private _storage: Storage, private _backend: Backend) {}

    getEvents(): Promise<EventItem[]> {
        return this._storage.getEvents().then(events => {
            if(events.length > 0){
                return events;
            } else {
                return this._backend.getEvents().then(remoteEvents => {
                    this._storage.setEvents(remoteEvents);
                    return remoteEvents;
                });
            }
        });
    }

    fetchEvents(): Promise<EventItem[]> {
        return this._backend.getEvents().then(remoteEvents => {
            this._storage.setEvents(remoteEvents);
            return remoteEvents;
        });
    }

    getEvent(uuid: string): Promise<EventFull> {
        return this._storage.getEvent(uuid).then(event => {
            if(event){
                return event;
            } else {
                return this._backend.getEvent(uuid).then(remoteEvent => {
                    this._storage.setEvent(remoteEvent);
                    return remoteEvent;
                });
            }
        });
    }

    fetchEvent(uuid: string): Promise<EventFull> {
        return this._backend.getEvent(uuid).then(remoteEvent => {
            this._storage.setEvent(remoteEvent);
            return remoteEvent;
        });
    }
}

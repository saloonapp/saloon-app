import {Injectable} from "angular2/core";
import {EventList, EventFull} from "../models/Event";
import {Storage} from "../../common/storage.service";
import {Backend} from "../../common/backend.service";

@Injectable()
export class EventService {
    constructor(private _storage: Storage,
                private _backend: Backend) {}

    getEvents(): Promise<EventList> {
        return this._storage.getEvents().then(eventList => {
            if(eventList && eventList.events && eventList.events.length > 0){
                return eventList;
            } else {
                return this._backend.getEvents().then(remoteEventList => {
                    this._storage.setEvents(remoteEventList);
                    return remoteEventList;
                });
            }
        });
    }

    fetchEvents(): Promise<EventList> {
        return this._backend.getEvents().then(remoteEventList => {
            this._storage.setEvents(remoteEventList);
            return remoteEventList;
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

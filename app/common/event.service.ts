import {Injectable} from "angular2/core";
import {EventFull} from "../models/EventFull";
import {EventItem} from "../models/EventItem";
import {AttendeeFull} from "../models/AttendeeFull";
import {SessionFull} from "../models/SessionFull";
import {ExponentFull} from "../models/ExponentFull";
import {Storage} from "./storage.service";
import {Backend} from "./backend.service";

@Injectable()
export class EventService {
    private currentEvent: EventFull;
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

    setCurrentEvent(event: EventFull): void {
        this.currentEvent = event;
    }
    getAttendeeFromCurrent(uuid: string): AttendeeFull {
        return this.currentEvent.attendees.find(e => e.uuid === uuid);
    }
    getSessionFromCurrent(uuid: string): SessionFull {
        return this.currentEvent.sessions.find(e => e.uuid === uuid);
    }
    getExponentFromCurrent(uuid: string): ExponentFull {
        return this.currentEvent.exponents.find(e => e.uuid === uuid);
    }
}

import {Injectable} from "angular2/core";
import {EventFull} from "../models/EventFull";
import {EventItem} from "../models/EventItem";
import {AttendeeFull} from "../models/AttendeeFull";
import {SessionFull} from "../models/SessionFull";
import {ExponentFull} from "../models/ExponentFull";
import {Storage} from "../../common/storage.service";
import {Backend} from "../../common/backend.service";

@Injectable()
export class EventService {
    private currentEventItem: EventItem;
    private currentEventFull: Promise<EventFull>;
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

    setCurrentEvent(event: EventItem): void {
        this.currentEventItem = event;
        this.currentEventFull = this.getEvent(event.uuid);
    }
    updateCurrentEvent(eventItem: EventItem, eventFull: EventFull): void {
        this.currentEventItem = eventItem;
        this.currentEventFull = Promise.resolve(eventFull);
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
}

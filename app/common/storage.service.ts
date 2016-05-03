import {Injectable} from "angular2/core";
import {StorageUtils} from "./services/storage-utils.service";
import {EventItem, EventFull} from "../event/models/Event";
import {UserAction} from "../user/models/UserAction";
import {Sort} from "./utils/array";

@Injectable()
export class Storage {
    constructor(private _storage: StorageUtils) {}

    getEvents(): Promise<EventItem[]> {
        return this._storage.get('events', [])
            .then(array => array.map(item => EventItem.fromJS(item)))
            .then(null, err => []);
    }

    setEvents(events: EventItem[]): Promise<void> {
        return this._storage.set('events', events);
    }

    getEvent(uuid: string): Promise<EventFull> {
        return this._storage.get('event-'+uuid)
            .then(item => item ? EventFull.fromJS(item) : item)
            .then(null, err => undefined);
    }

    setEvent(eventFull: EventFull): Promise<void> {
        this.getEvents().then(events => {
            const updatedEvents = events.map(event => event.uuid === eventFull.uuid ? eventFull.toItem() : event);
            this.setEvents(updatedEvents);
        });
        return this._storage.set('event-'+eventFull.uuid, eventFull);
    }

    getUserActions(eventId: string): Promise<UserAction<any>[]> {
        return this._storage.get('actions-'+eventId, [])
            .then(array => array.map(item => UserAction.fromJS(item)));
    }

    setUserActions(eventId: string, actions: UserAction<any>[]): Promise<void> {
        return this._storage.set('actions-'+eventId, actions.sort((e1, e2) => Sort.num(e1.created, e2.created)));
    }

    clear(): Promise<void> {
        return this._storage.clear();
    }
}

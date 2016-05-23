import {Injectable} from "@angular/core";
import {StorageUtils} from "./services/storage-utils.service";
import {EventList, EventFull} from "../event/models/Event";
import {UserAction} from "../user/models/UserAction";
import {Sort} from "./utils/array";

@Injectable()
export class Storage {
    constructor(private _storage: StorageUtils) {}

    getEvents(): Promise<EventList> {
        return this._storage.get('events', [])
            .then(item => item ? EventList.fromJS(item) : item)
            .then(null, err => undefined);
    }

    setEvents(eventList: EventList): Promise<void> {
        return this._storage.set('events', eventList);
    }

    getEvent(eventId: string): Promise<EventFull> {
        return this._storage.get('event-'+eventId)
            .then(item => item ? EventFull.fromJS(item) : item)
            .then(null, err => undefined);
    }

    setEvent(eventFull: EventFull): Promise<void> {
        this.getEvents().then(eventList => {
            eventList.events = eventList.events.map(event => event.uuid === eventFull.uuid ? eventFull.toItem() : event);
            this.setEvents(eventList);
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

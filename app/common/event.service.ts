import {Injectable} from "angular2/core";
import {EventItem} from "../models/EventItem";
import {Backend} from "./backend.service";

@Injectable()
export class EventService {
    constructor (private _backend: Backend) {}
    getEvents(): Promise<EventItem[]> {
        return this._backend.getEvents();
    }
}

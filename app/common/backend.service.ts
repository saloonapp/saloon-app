import {Injectable} from 'angular2/core';
import {Http, Response} from "angular2/http";
import {Observable} from "rxjs/Observable";
import "rxjs/Rx";
import {EventItem} from "../models/EventItem";
import {EventFull} from "../models/EventFull";

@Injectable()
export class Backend {
    private _backendUrl = 'https://dev-saloon.herokuapp.com/api/v1';
    constructor(private _http: Http) {}

    getEvents(): Promise<EventItem[]> {
        return new Promise((resolve, reject) => {
            this._http.get(this._backendUrl+'/events/all')
                .map(res => <EventItem[]> res.json())
                .do(data => console.log('Backend.getEvents', data))
                .catch(this.handleError)
                .subscribe(
                    events => resolve(events),
                    error => reject(error)
                );
        });
    }

    getEvent(uuid: string): Promise<EventFull> {
        return new Promise((resolve, reject) => {
            this._http.get(this._backendUrl+'/events/'+uuid+'/full')
                .map(res => <EventFull> res.json())
                .do(data => console.log('Backend.getEvent('+uuid+')', data))
                .catch(this.handleError)
                .subscribe(
                    events => resolve(events),
                    error => reject(error)
                );
        });
    }

    private handleError(error: Response) {
        console.error('Backend error', error);
        return Observable.throw(error.json().error || 'Server error');
    }
}

import {Injectable} from "angular2/core";
import {Feedback} from "../../common/models/Feedback";
import {EventItem, EventFull} from "../models/Event";
import {AttendeeItem, AttendeeFull} from "../models/Attendee";
import {SessionItem, SessionFull} from "../models/Session";
import {ExponentItem, ExponentFull} from "../models/Exponent";
import {UserAction} from "../../user/models/UserAction";
import {DateHelper} from "../../common/utils/date";
import {Storage} from "../../common/storage.service";
import {EventService} from "./event.service";

@Injectable()
export class EventData {
    private currentEventItem: EventItem;
    private currentEventFull: Promise<EventFull>;
    private userActions: {[key: string]: {[key: string]: {[key: string]: any}}} = null;
    constructor(private _storage: Storage,
                private _eventService: EventService) {}

    setCurrentEvent(eventItem: EventItem, eventFull?: EventFull): void {
        this.setEvent(eventItem, eventFull ? Promise.resolve(eventFull) : this._eventService.getEvent(eventItem.uuid));
    }

    getCurrentEventItem(): EventItem          { return this.currentEventItem; }
    getCurrentEventFull(): Promise<EventFull> { return this.currentEventFull; }

    getSessionFromCurrent (uuid: string): Promise<SessionFull>  { return this.currentEventFull.then(event => event.sessions. find(e => e.uuid === uuid)); }
    getAttendeeFromCurrent(uuid: string): Promise<AttendeeFull> { return this.currentEventFull.then(event => event.attendees.find(e => e.uuid === uuid)); }
    getExponentFromCurrent(uuid: string): Promise<ExponentFull> { return this.currentEventFull.then(event => event.exponents.find(e => e.uuid === uuid)); }

    getSessionFavorite (session : SessionItem )                 : boolean       { return this.getUserAction<boolean>('favorite', 'session' , session.uuid , false);                 }
    getAttendeeFavorite(attendee: AttendeeItem)                 : boolean       { return this.getUserAction<boolean>('favorite', 'attendee', attendee.uuid, false);                 }
    getExponentFavorite(exponent: ExponentItem)                 : boolean       { return this.getUserAction<boolean>('favorite', 'exponent', exponent.uuid, false);                 }
    toggleSessionFavorite (session : SessionItem )              : Promise<void> {       return this.toggleUserAction('favorite', 'session' , session.uuid);                         }
    toggleAttendeeFavorite(attendee: AttendeeItem)              : Promise<void> {       return this.toggleUserAction('favorite', 'attendee', attendee.uuid);                        }
    toggleExponentFavorite(exponent: ExponentItem)              : Promise<void> {       return this.toggleUserAction('favorite', 'exponent', exponent.uuid);                        }
    getSessionRating (session : SessionItem )                   : number        {  return this.getUserAction<number>('rating', 'session' , session.uuid , 0);                       }
    getAttendeeRating(attendee: AttendeeItem)                   : number        {  return this.getUserAction<number>('rating', 'attendee', attendee.uuid, 0);                       }
    getExponentRating(exponent: ExponentItem)                   : number        {  return this.getUserAction<number>('rating', 'exponent', exponent.uuid, 0);                       }
    setSessionRating (session : SessionItem , value: number)    : Promise<void> {  return this.setUserAction<number>('rating', 'session' , session.uuid , value);                   }
    setAttendeeRating(attendee: AttendeeItem, value: number)    : Promise<void> {  return this.setUserAction<number>('rating', 'attendee', attendee.uuid, value);                   }
    setExponentRating(exponent: ExponentItem, value: number)    : Promise<void> {  return this.setUserAction<number>('rating', 'exponent', exponent.uuid, value);                   }
    getSessionFeedback (session : SessionItem )                 : Feedback      {  return this.getUserAction<Feedback>('feedback', 'session' , session.uuid , new Feedback(0, '')); }
    getAttendeeFeedback(attendee: AttendeeItem)                 : Feedback      {  return this.getUserAction<Feedback>('feedback', 'attendee', attendee.uuid, new Feedback(0, '')); }
    getExponentFeedback(exponent: ExponentItem)                 : Feedback      {  return this.getUserAction<Feedback>('feedback', 'exponent', exponent.uuid, new Feedback(0, '')); }
    setSessionFeedback (session : SessionItem , value: Feedback): Promise<void> {  return this.setUserAction<Feedback>('feedback', 'session' , session.uuid , value);               }
    setAttendeeFeedback(attendee: AttendeeItem, value: Feedback): Promise<void> {  return this.setUserAction<Feedback>('feedback', 'attendee', attendee.uuid, value);               }
    setExponentFeedback(exponent: ExponentItem, value: Feedback): Promise<void> {  return this.setUserAction<Feedback>('feedback', 'exponent', exponent.uuid, value);               }

    private getUserAction<T>(action: string, itemType: string, itemId: string, defaultValue?: T): T {
        return this.userActions && this.userActions[action] && this.userActions[action][itemType] ? this.userActions[action][itemType][itemId] || defaultValue : defaultValue;
    }
    private setUserAction<T>(action: string, itemType: string, itemId: string, value: T): Promise<void> {
        const eventId = this.currentEventItem.uuid;
        return this._storage.getUserActions(eventId).then(actions => {
            actions.push(new UserAction<T>(action, eventId, itemType, itemId, value, DateHelper.now()));
            return this._storage.setUserActions(eventId, actions);
        }).then(() => {
            this.setUserActionCache(action, itemType, itemId, value);
        });
    }
    private toggleUserAction(action: string, itemType: string, itemId: string): Promise<void> {
        if(this.getUserAction<boolean>(action, itemType, itemId, false)){
            return this.setUserAction<boolean>(action, itemType, itemId, false);
        } else {
            return this.setUserAction<boolean>(action, itemType, itemId, true);
        }
    }

    private setEvent(eventItem: EventItem, eventFullPromise: Promise<EventFull>): void {
        this.currentEventItem = eventItem;
        this.currentEventFull = eventFullPromise;
        // should be initialized with all values to correctly be updated in UI (for the first time)
        this.userActions = {
            favorite: {session: {}, attendee: {}, exponent: {}},
            rating: {session: {}, attendee: {}, exponent: {}}
        };
        this._storage.getUserActions(eventItem.uuid).then(actions => {
            actions.map(action => {
                this.setUserActionCache(action.action, action.itemType, action.itemId, action.value);
            });
        });
    }
    private setUserActionCache(action: string, itemType: string, itemId: string, value: any): void {
        if(!this.userActions){ this.userActions = {}; }
        if(!this.userActions[action]){ this.userActions[action] = {}; }
        if(!this.userActions[action][itemType]){ this.userActions[action][itemType] = {}; }
        this.userActions[action][itemType][itemId] = value;
    }
}

import {Injectable} from "angular2/core";
import {UserAction} from "../models/UserAction";
import {DateHelper} from "../../common/utils/date";
import {Storage} from "../../common/storage.service";

@Injectable()
export class UserService {
    constructor(private _storage: Storage) {}

    getUserActions(eventId: string): Promise<UserAction<any>[]> {
        return this._storage.getUserActions(eventId);
    }

    addUserAction<T>(eventId: string, action: string, itemType: string, itemId: string, value: T): Promise<void> {
        return this._storage.getUserActions(eventId).then(actions => {
            actions.push(new UserAction<T>(action, eventId, itemType, itemId, value, DateHelper.now()));
            return this._storage.setUserActions(eventId, actions);
        })
    }
}

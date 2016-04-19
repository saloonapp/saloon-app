import {SessionItem} from "../../event/models/SessionItem";
import {AttendeeItem} from "../../event/models/AttendeeItem";

export class UserAction {
    constructor(public action: string,
                public eventId: string,
                public itemType: string,
                public itemId: string) {}
    public static favorite(eventId: string, type: string, uuid: string): UserAction {
        return new UserAction('favorite', eventId, type, uuid);
    }
    public static isFavorite(action: UserAction, type: string, uuid: string): boolean {
        return action.action === 'favorite' && action.itemType === type && action.itemId === uuid;
    }
}

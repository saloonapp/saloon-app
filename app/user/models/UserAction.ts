import {SessionItem} from "../../event/models/SessionItem";
export class UserAction {
    constructor(public action: string,
                public eventId: string,
                public itemType: string,
                public itemId: string) {}
    public static favoriteSession(eventId: string, session: SessionItem): UserAction {
        return new UserAction('favorite', eventId, 'session', session.uuid);
    }
    public static isFavoriteSession(action: UserAction, session: SessionItem): boolean {
        return action.action === 'favorite' && action.itemType === 'session' && action.itemId === session.uuid;
    }
}

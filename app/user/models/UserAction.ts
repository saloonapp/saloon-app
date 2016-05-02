import {Serializable} from "../../common/models/Serializable";

export class UserAction extends Serializable {
    constructor(public action: string,
                public eventId: string,
                public itemType: string,
                public itemId: string) { super(); }
    isFavorite(type: string, uuid: string): boolean {
        return this.action === 'favorite' && this.itemType === type && this.itemId === uuid;
    }
    public static favorite(eventId: string, type: string, uuid: string): UserAction {
        return new UserAction('favorite', eventId, type, uuid);
    }
}

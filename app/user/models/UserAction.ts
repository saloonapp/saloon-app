import {Serializable} from "../../common/models/Serializable";
import {DateHelper} from "../../common/utils/date";

export class UserAction extends Serializable {
    constructor(public action: string,
                public eventId: string,
                public itemType: string,
                public itemId: string,
                public created: number,
                public custom?: any) { super(); }
    isFavorite(type: string, uuid: string): boolean {
        return this.action === 'favorite' && this.itemType === type && this.itemId === uuid;
    }
    isRating(type: string, uuid: string): boolean {
        return this.action === 'rating' && this.itemType === type && this.itemId === uuid;
    }
    public static favorite(eventId: string, type: string, uuid: string, value: boolean): UserAction {
        return new UserAction('favorite', eventId, type, uuid, DateHelper.now(), {value: value});
    }
    public static rating(eventId: string, type: string, uuid: string, value: number): UserAction {
        return new UserAction('rating', eventId, type, uuid, DateHelper.now(), {value: value});
    }
}

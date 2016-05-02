import {Serializable} from "../../common/models/Serializable";
import {Address} from "../../common/models/Address";
import {SessionItem} from "./Session";
import {ExponentItem} from "./Exponent";

export class AttendeeItem extends Serializable {
    constructor(public uuid: string,
                public role: string,
                public name: string,
                public description: string,
                public descriptionHTML: string,
                public avatar: string,
                public job: string,
                public company: string,
                public website: string,
                public twitterUrl: string,
                public updated: number) { super(); }
}


export class AttendeeFull extends Serializable {
    constructor(public uuid: string,
                public role: string,
                public name: string,
                public firstName: string,
                public lastName: string,
                public description: string,
                public descriptionHTML: string,
                public avatar: string,
                public email: string,
                public phone: string,
                public address: Address,
                public job: string,
                public company: string,
                public website: string,
                public twitterUrl: string,
                public sessions: SessionItem[],
                public exponents: ExponentItem[],
                public updated: number) { super(); }
    toItem(): AttendeeItem {
        return new AttendeeItem(
            this.uuid,
            this.role,
            this.name,
            this.description,
            this.descriptionHTML,
            this.avatar,
            this.job,
            this.company,
            this.website,
            this.twitterUrl,
            this.updated);
    }

    // override Serializable.fromJS to correctly parse nested class
    public static fromJS(jsonObj: any): AttendeeFull {
        const instance     = <AttendeeFull> super.fromJS(jsonObj);
        instance.address   = <Address> Address.fromJS(jsonObj.address);
        instance.sessions  = <SessionItem[]> instance.sessions.map(item => SessionItem.fromJS(item));
        instance.exponents = <ExponentItem[]> instance.exponents.map(item => ExponentItem.fromJS(item));
        return instance;
    }
}

export class AttendeeItem {
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
                public updated: number) {}
}

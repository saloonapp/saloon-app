export class Serializable {
    public static fromJSON<U>(json: string): U {
        const jsonObj = JSON.parse(json);
        return this.fromJS<U>(jsonObj);
    }
    public static fromJS<U>(jsonObj: any): U {
        let instance = new this();
        for (let key in jsonObj) {
            if(!jsonObj.hasOwnProperty(key)) { continue; }
            instance[key] = jsonObj[key]
        }
        return instance;
    }
}

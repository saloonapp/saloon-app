export class Serializable {
    public static fromJSON(json: string) {
        const jsonObj = JSON.parse(json);
        return this.fromJS(jsonObj);
    }
    public static fromJS(jsonObj: any) {
        let instance = new this();
        for (let key in jsonObj) {
            if(!jsonObj.hasOwnProperty(key)) { continue; }
            instance[key] = jsonObj[key]
        }
        return instance;
    }
}

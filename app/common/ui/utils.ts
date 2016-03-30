import {Injectable} from "angular2/core";
import {NavController, Alert} from "ionic-angular/index";

@Injectable()
export class UiUtils {
    alert(nav: NavController, title: string, subTitle?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let alert = Alert.create({
                title: title,
                subTitle: subTitle,
                buttons: [{
                    text: 'Ok',
                    handler: data => {
                        resolve();
                    }
                }]
            });
            nav.present(alert);
        });
    }
    confirm(nav: NavController, title: string, subTitle?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let alert = Alert.create({
                title: title,
                subTitle: subTitle,
                buttons: [{
                    text: 'No',
                    handler: () => reject()
                }, {
                    text: 'Yes',
                    handler: () => resolve()
                }]
            });
            nav.present(alert);
        });
    }
}

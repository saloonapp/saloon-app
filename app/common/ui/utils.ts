import {Injectable} from "angular2/core";
import {NavController, Alert} from "ionic-angular/index";

@Injectable()
export class UiUtils {

    alert(nav: NavController, title: string, subTitle?: string): void {
        let alert = Alert.create({
            title: title,
            subTitle: subTitle,
            buttons: ['Ok']
        });
        nav.present(alert);
    }
}

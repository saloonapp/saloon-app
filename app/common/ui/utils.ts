import {Injectable} from "angular2/core";
import {NavController, Alert, Loading, Toast} from "ionic-angular/index";
import {ObjectHelper} from "../utils/object";

@Injectable()
export class UiHelper {
    private loading = null;
    private loadingPromise = null;

    alert(nav: NavController, title: string, subTitle?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const alert = Alert.create({
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
            const alert = Alert.create({
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
    showLoading(nav: NavController, opts?: any): Promise<void> {
        if (this.loadingPromise === null) {
            this.loadingPromise = new Promise<void>((resolve, reject) => {
                this.loading = Loading.create(ObjectHelper.merge({content: 'loading...'}, opts));
                this.loading.onDismiss(() => {
                    this.loading = null;
                    this.loadingPromise = null;
                    resolve();
                });
                nav.present(this.loading);
            });
        }
        return this.loadingPromise;
    }
    hideLoading(): void {
        if (this.loading !== null) {
            this.loading.dismiss();
        }
    }
    showToast(nav: NavController, message: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let toast = Toast.create({
                message: message,
                duration: 3000,
                enableBackdropDismiss: false
            });
            toast.onDismiss(() => {
                resolve();
            });
            nav.present(toast);
        });
    }
}

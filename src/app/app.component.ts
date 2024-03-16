import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import {UserService} from './services/user.service';
import {LocalNotifications, LocalNotificationSchema, ActionPerformed as LocalActionPerformed} from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private nav:NavController, private userService:UserService) {this.initPush();}

  async initPush() {
    if (Capacitor.getPlatform()!=='web') {
      this.registerPush();
    }
  }
  
  registerPush() {

    PushNotifications.getDeliveredNotifications().then(res=>{
      console.log("PushNotifications.getDeliveredNotifications");
      console.log(res);
    });
    PushNotifications.requestPermissions().then ( (permission:any) =>{
      
      if (permission.receive === 'granted'  ) {
        PushNotifications.register();
        console.log("Permissions to receive PUSH notifications granted");
      } else {
        console.log("No permissions to receive PUSH notifications");
      }

    });

    PushNotifications.removeAllListeners();

    PushNotifications.addListener('registration', token => {
      console.info('Registration token: ', token.value);
      localStorage.setItem(environment.prefix + "push_id",token.value);
      setTimeout(() => {
        this.userService.updatePushId(token.value).then((data) => {
          console.log("push_id sended to server");
          console.log(data);
          console.log(token);
        });  
      }, 1000);      
    }); 

    PushNotifications.addListener('pushNotificationActionPerformed', notification => {
      console.log('Push notification action performed', notification.actionId, notification.inputValue);
      console.log(notification);

		  if (notification.actionId==='tap' && notification.notification.data.route!= undefined) {
        console.log("Push notification has extra route, store to local storage "+notification.notification.data.route);
        localStorage.setItem(environment.prefix +"push:push_navigation",notification.notification.data.route);
        if (notification.notification.data.route.includes('open_win_order/')) this.nav.navigateForward(['orders-closed']);
        if (notification.notification.data.route.includes('open_action_order/')) this.nav.navigateForward(['orders']);
      }      

    });    

    PushNotifications.addListener('pushNotificationReceived', async notification => {
      console.log('Push notification received: ', notification);

      var options:LocalNotificationSchema = {
        id: 1,
        title: notification.title!,
        body: notification.body!,
        summaryText: notification.body,
        largeBody: notification.body,
        extra: notification.data,
        schedule:{at: new Date( new Date().getTime()+100)},
        smallIcon: "local_push_logo"
      }


      
      await LocalNotifications.schedule({notifications:[options]});

      /*this.localNotifications.schedule({
        id: 1,
        text: notification.body,
        title: notification.title,
        foreground: true
      });      */
    });


		LocalNotifications.addListener("localNotificationActionPerformed", (notification:LocalActionPerformed) => {
		  console.log("Local notification action performed", notification.actionId, notification.inputValue);
		  if (notification.actionId==='tap' && notification.notification.extra.route!= undefined) {
        console.log("Local notification has extra route "+notification.notification.extra.route);
        localStorage.setItem(environment.prefix +"push:push_navigation",notification.notification.extra.route);
        if (notification.notification.extra.route.includes('open_win_order/')) this.nav.navigateForward(['orders-closed']);
        if (notification.notification.extra.route.includes('open_action_order/')) this.nav.navigateForward(['orders']);
		  }
		  console.log(notification);
		});  

  }
}

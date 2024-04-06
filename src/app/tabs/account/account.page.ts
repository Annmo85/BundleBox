import { Component, OnInit } from '@angular/core';
import { IonInput, ModalController, NavController, PopoverController, ToastController } from '@ionic/angular';
import {UserService} from '../../services/user.service';
@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  current_tab:string = "account";
  delete_request: boolean = false;
  is_loaded: boolean = false;
  public profile:any = {};
  public pvz_list:any = [];  

  constructor(private modalCtrl: ModalController, private toastController:ToastController,private userService:UserService, private nav:NavController,) { }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getProfile().then( res=>{
      this.profile = res.user;
      this.pvz_list = res.pvz_list;
      this.is_loaded = true;
    })
  }


  deleteRequest() {
    //this.nav.navigateRoot(['profile'],{animationDirection:"forward"});
    this.userService.deleteRequest().then(async ()=>{
      this.userService.logout();
      const toast = await this.toastController.create({
        message: 'Информация удалена.',
        duration: 2000,
        color: "blue"
      });
      toast.present();
      this.nav.navigateRoot(['start'],{animationDirection:"forward"});
    })
  }

  openPvzList() {
    this.nav.navigateForward(['/tabs/account/select-pvz']);
  }

}

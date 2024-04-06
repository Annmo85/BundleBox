import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ModalController, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-select-pvz',
  templateUrl: './select-pvz.page.html',
  styleUrls: ['./select-pvz.page.scss'],
})
export class SelectPVZPage implements OnInit {

  search: string = "";
  is_loaded: boolean = false;
  public pvz_list: any = [];
  public stores_list_filtered: any = [];

  constructor(private modalCtrl: ModalController, private toastController: ToastController, private userService: UserService, private nav: NavController) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getProfile().then(res => {
      this.pvz_list = res.pvz_list;
      this.stores_list_filtered = res.pvz_list;
      console.log(this.pvz_list);
      this.is_loaded = true;
    })
  }



  handleSearchInput(ev: any) {
    console.log(ev);

    if (ev.detail.value === "") {
      this.stores_list_filtered = this.pvz_list;
    } else {
      this.stores_list_filtered = this.pvz_list.filter((x: any) => (x.VALUE as string).toLowerCase().includes(ev.detail.value.toLowerCase()));
    }
  }

  selectPVZ(pvz: any) {
    this.is_loaded = false;
    this.userService.updatePvz(pvz).then(async () => {
      const toast = await this.toastController.create({
        message: 'Информация обновлена.',
        duration: 2000,
        color: "accent"
      });
      this.nav.back();
      toast.present();
    })
  }
}

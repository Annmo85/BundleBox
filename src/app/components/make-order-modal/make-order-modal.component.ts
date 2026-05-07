import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {OrderFormComponent} from '../order-form/order-form.component'

@Component({
  selector: 'app-make-order-modal',
  templateUrl: './make-order-modal.component.html',
  styleUrls: ['./make-order-modal.component.scss'],
})
export class MakeOrderModalComponent  implements OnInit {

  constructor(private modalCtrl:ModalController) { }

  ngOnInit() {}
 
  openTg() {
    window.open("https://t.me/annabbox","_blank");
  }

  openMax() {
    window.open("https://max.ru/u/f9LHodD0cOK84GzXHDeicQ8T-VZoi-O6vl7o-MTZIQUOKuaFEKwIykcbBM4","_blank");
  }

  openVb() {
    window.open("viber://contact?number=%2B79025665111","_blank");
  }


  async openMakeOrderFormModal() {
    this.modalCtrl.dismiss();
    const modal = await this.modalCtrl.create({
      component: OrderFormComponent,
      cssClass: "makeOrderModal",
      mode: 'ios'
    });
    modal.present();
  }  
}

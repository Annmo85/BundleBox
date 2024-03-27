import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { MakeOrderModalComponent } from 'src/app/components/make-order-modal/make-order-modal.component';

@Component({
  selector: 'app-store-modal',
  templateUrl: './store-modal.component.html',
  styleUrls: ['./store-modal.component.scss'],
})
export class StoreModalComponent  implements OnInit {

  public store_item: any = {};
  constructor( private modalCtrl: ModalController, public sanitizer:DomSanitizer) { }

  ngOnInit() {
    console.log(this.store_item);
  }


  close() {
    this.modalCtrl.dismiss();
  }

  async openMakeOrderModal() {
    const modal = await this.modalCtrl.create({
      component: MakeOrderModalComponent,
      initialBreakpoint: 0.3,
      breakpoints: [0,0,3],
      cssClass: "makeOrderModal",
      mode: 'ios'
    });
    modal.present();
  }  

}

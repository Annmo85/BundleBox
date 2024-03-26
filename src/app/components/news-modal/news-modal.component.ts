import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { MakeOrderModalComponent } from 'src/app/components/make-order-modal/make-order-modal.component';
@Component({
  selector: 'app-news-modal',
  templateUrl: './news-modal.component.html',
  styleUrls: ['./news-modal.component.scss'],
})
export class NewsModalComponent  implements OnInit {
  public news_item: any = {};
  constructor( private modalCtrl: ModalController, public sanitizer:DomSanitizer) { }

  ngOnInit() {
    console.log(this.news_item);
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

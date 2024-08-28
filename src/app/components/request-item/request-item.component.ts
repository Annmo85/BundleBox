import { Component, Input, OnInit } from '@angular/core';
import { ImageZoomPage } from '../../image-zoom/image-zoom.page';
import { LoadingController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-request-item',
  templateUrl: './request-item.component.html',
  styleUrls: ['./request-item.component.scss'],
})
export class RequestItemComponent  implements OnInit {

  @Input() request: any = null;

  constructor(private loadingCtrl:LoadingController, private modalCtrl: ModalController, ) { }

  ngOnInit() {}


  openUrl() {
    window.open(this.request.URL, "_blank");
  }

  async openImage(img:string) {
    const loading = await this.loadingCtrl.create({
      message: 'Подождите...',
      mode: "ios"
    });
    loading.present();
    const modal = await this.modalCtrl.create({
      component: ImageZoomPage,
      componentProps: { img: img },
      cssClass: 'transparent-modal'
    });
    loading.dismiss();
    modal.present();    
  }



}

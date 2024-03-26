import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ImageZoomPage } from '../../image-zoom/image-zoom.page';
import { ModalController, LoadingController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-review-item',
  templateUrl: './review-item.component.html',
  styleUrls: ['./review-item.component.scss'],
})
export class ReviewItemComponent  implements OnInit {

  url: string = "";
  @Input() review:any = null;
  public _preview:boolean = false;
  public _link:any = "";
  @Input() set preview (val:any) {
    this._preview = val;
  }


  constructor(private nav: NavController, private modalCtrl: ModalController, private loadingCtrl:LoadingController,) { }

  ngOnInit() {
    this.url = environment.api_url;
  }

  async openPreview() {
    const loading = await this.loadingCtrl.create({
       message: 'Подождите...',
       mode: "ios"
    });
    loading.present();
    const modal = await this.modalCtrl.create({
      component: ImageZoomPage,
       componentProps: {img: this.url + this.review.image},
       cssClass: 'transparent-modal'
     });
    loading.dismiss();
    modal.present();
  }
}

import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { UserService } from '../../services/user.service';
import {OfertaComponent} from '../../components/oferta/oferta.component';

@Component({
  selector: 'app-usl-page',
  templateUrl: './usl-page.component.html',
  styleUrls: ['./usl-page.component.scss'],
})
export class UslPageComponent  implements OnInit {


  usl_text:any = [];
  is_load: boolean = false;
  constructor( public sanitizer:DomSanitizer, private userService:UserService, private modalCtrl:ModalController) { }

  ngOnInit() {
    this.loadUslData();
  }

  loadUslData(event:any = null) {

    Promise.all([this.userService.loadNews()]).then( (response:any) => {
      this.usl_text = response[0].usl_text;
      this.is_load = true;      
    })
  }  

  close() {
    this.modalCtrl.dismiss();
  }

  async openOferta(event:any) {
    if (event.target.tagName=="A") {
      const modal = await this.modalCtrl.create({
        component: OfertaComponent,
        componentProps: {deal:{ID:"________",DATE:"________"}}
      });
      modal.present();
    }
  }

}

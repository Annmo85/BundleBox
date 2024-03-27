import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-oferta',
  templateUrl: './oferta.component.html',
  styleUrls: ['./oferta.component.scss'],
})
export class OfertaComponent  implements OnInit {

  is_load: boolean = false;
  deal: any;
  text: any;
  formated_text: any;
  constructor( public sanitizer:DomSanitizer, private userService:UserService, private modalCtrl:ModalController) { }

  ngOnInit() {
    console.log("deal",this.deal);
    this.loadOferta();
  }

  loadOferta(event:any = null) {

    Promise.all([this.userService.loadOferta()]).then( (response:any) => {
      let text:string = response[0].content as string;
      text = text.replace("[LEAD_ID]",this.deal.ID).replace("[LEAD_DATE]",this.deal.DATE);
      this.formated_text = this.sanitizer.bypassSecurityTrustHtml(text);
      this.is_load = true;      
    })
  }  


  close() {
    this.modalCtrl.dismiss();
  }

}

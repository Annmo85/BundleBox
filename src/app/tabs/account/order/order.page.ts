import { Component, Input, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController,PopoverController } from '@ionic/angular';
import {HelperPopoverComponent} from '../../../components/helper-popover/helper-popover.component';
import {PaymenDeliveryInstructionComponent} from '../../../components/paymen-delivery-instruction/paymen-delivery-instruction.component';
import {PaymentInstructionComponent} from '../../../components/payment-instruction/payment-instruction.component';
import { ModalController, ToastController } from '@ionic/angular';
import { UserService } from '../../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Clipboard } from '@capacitor/clipboard';
import {BarcodeModalComponent} from '../../../components/barcode-modal/barcode-modal.component';
import { ImageZoomPage } from '../../../image-zoom/image-zoom.page';
import { finalize } from 'rxjs/operators';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {

  public order_id:any;
  public store_id:any;
  public is_load:boolean = false;
  public show_review:boolean = false;
  public review_stars:number = 4;

  public order_info: any;

  review_name: string = "";
  review_text: string = "";
  review_store_id: string = "";
  review_share: boolean = true;

  otchet_komissionera:any = null;

  bgcolor:string = "";

  constructor(private alertController:AlertController, private sanitizer: DomSanitizer, private loadingCtrl:LoadingController, private http:HttpClient,private userService:UserService, private modalCtrl: ModalController, private toastController:ToastController,private nav:NavController,private popoverController: PopoverController) { }


  doRefreshLead(event:any) {
    console.log(this.order_id);
    console.log(this.store_id);
    this.userService.loadLead(this.order_id, true).then( response =>{
      this.order_info = response;
      console.log("this.order_info",this.order_info);
      if (this.order_info.deal.CUSTOMER == null) this.order_info.deal.CUSTOMER = "Покупатель";
      this.review_name = this.order_info.deal.CUSTOMER;
      //if (this.order_info.deal.CUSTOMER.trim().indexOf(" ")>0) this.review_name = this.order_info.deal.CUSTOMER.substr(0, this.order_info.deal.CUSTOMER.trim().indexOf(" "));
      this.review_store_id = this.store_id;

      this.userService.loadOferta().then((response:any)=>{
        let othet:string = response.otchet_komissionera;
        othet = othet.replace("[LEAD_SUMM]",this.order_info.deal.SUM);
        let percent = ((this.order_info.deal_detail.OPPORTUNITY as number) * 5 / 100).toFixed(0)+" руб";
        othet = othet.replace("[LEAD_PERCENT_SUMM]",percent);
        this.otchet_komissionera = this.sanitizer.bypassSecurityTrustHtml(othet);
      })

      if (this.order_info.deal.STAGE === "Отправлено магазином") this.bgcolor = "#FCF2CF;";
      else if (this.order_info.deal.STAGE === "Ожидает выкупа") this.bgcolor = "#FADBEB;";
      else if (this.order_info.deal.STAGE === "Оплатите заказ") this.bgcolor = "#FFA39B;";
      else if (this.order_info.deal.STAGE === "Оплачено") this.bgcolor = "#DAE1F1;";
      else if (this.order_info.deal.STAGE === "Получено на складе") this.bgcolor = "#F8DA78;";
      else if (this.order_info.deal.STAGE === "Посылка отправлена") this.bgcolor = "#CBE0B9;";
      else if (this.order_info.deal.STAGE === "Оплатите доставку") this.bgcolor = "#FFA39B;";
      else if (this.order_info.deal.STAGE === "Доставка оплачена") this.bgcolor = "#DAE1F1;";
      else if (this.order_info.deal.STAGE === "Получите заказ") this.bgcolor = "#FFA39B;";
      else if (this.order_info.deal.STAGE === "Заказ завершён") this.bgcolor = "#ADB9C7;";    
      else if (this.order_info.deal.STAGE === "Ждем компанию") this.bgcolor = "#ADB9C7;";    
      event.target.complete();
      this.is_load = true;
    })    
  }

  ngOnInit() {

    console.log(this.order_id);
    console.log(this.store_id);
    this.userService.loadLead(this.order_id).then( response =>{
      this.order_info = response;
      console.log("this.order_info",this.order_info);
      if (this.order_info.deal.CUSTOMER == null) this.order_info.deal.CUSTOMER = "Покупатель";
      this.review_name = this.order_info.deal.CUSTOMER;
      //if (this.order_info.deal.CUSTOMER.trim().indexOf(" ")>0) this.review_name = this.order_info.deal.CUSTOMER.substr(0, this.order_info.deal.CUSTOMER.trim().indexOf(" "));
      this.review_store_id = this.store_id;

      this.userService.loadOferta().then((response:any)=>{
        let othet:string = response.otchet_komissionera;
        othet = othet.replace("[LEAD_SUMM]",this.order_info.deal.SUM);
        let percent = ((this.order_info.deal_detail.OPPORTUNITY as number) * 5 / 100).toFixed(0)+" руб";
        othet = othet.replace("[LEAD_PERCENT_SUMM]",percent);
        this.otchet_komissionera = this.sanitizer.bypassSecurityTrustHtml(othet);
      })

      if (this.order_info.deal.STAGE === "Отправлено магазином") this.bgcolor = "#FCF2CF;";
      else if (this.order_info.deal.STAGE === "Ожидает выкупа") this.bgcolor = "#FADBEB;";
      else if (this.order_info.deal.STAGE === "Оплатите заказ") this.bgcolor = "#FFA39B;";
      else if (this.order_info.deal.STAGE === "Оплачено") this.bgcolor = "#DAE1F1;";
      else if (this.order_info.deal.STAGE === "Получено на складе") this.bgcolor = "#F8DA78;";
      else if (this.order_info.deal.STAGE === "Посылка отправлена") this.bgcolor = "#CBE0B9;";
      else if (this.order_info.deal.STAGE === "Оплатите доставку") this.bgcolor = "#FFA39B;";
      else if (this.order_info.deal.STAGE === "Доставка оплачена") this.bgcolor = "#DAE1F1;";
      else if (this.order_info.deal.STAGE === "Получите заказ") this.bgcolor = "#FFA39B;";
      else if (this.order_info.deal.STAGE === "Заказ завершён") this.bgcolor = "#ADB9C7;";    
      else if (this.order_info.deal.STAGE === "Заказ завершен") this.bgcolor = "#ADB9C7;";    

      this.is_load = true;
    })    

  }



  async openHelpPopover(help:string, e:Event) {
    const popover = await this.popoverController.create({
      component: HelperPopoverComponent,
      event: e,
      mode: "ios",
      cssClass: "stage_helper",
      componentProps: {stage_helper: help}
    });

    await popover.present();

    const { role } = await popover.onDidDismiss();    
  }  


  async openDeliveryPayment() {
    const modal = await this.modalCtrl.create({
      component: PaymenDeliveryInstructionComponent,
      mode: "ios",
      breakpoints: [0.60,0.70,0.99],
      initialBreakpoint: 0.70, 
      componentProps: {order_id: this.order_info.deal.ID, deal:this.order_info.deal}
    });
    modal.present();     
    const { role, data } = await modal.onWillDismiss();  
    console.log('role');
    console.log(role);
    console.log(data);
    if (role === 'refresh') {
      this.userService.reloadLeads$.next(true);
   
    } 
  }

  async openPayment() {
    const modal = await this.modalCtrl.create({
      component: PaymentInstructionComponent,
      mode: "ios",
      breakpoints: [0.60,0.70,0.99],
      initialBreakpoint: 0.70, 
      componentProps: {order_id: this.order_info.deal.ID, order_info:this.order_info}
    });
    modal.present();     
    const { role, data } = await modal.onWillDismiss();  
    console.log('role');
    console.log(role);
    console.log(data);
    if (role === 'refresh') {
      this.userService.reloadLeads$.next(true);
   
    } 
  }

  copyToClip(phone:string) {
    Clipboard.write({string:phone}).then(async res=>{
      console.log(res);
      const toast = await this.toastController.create({
        message: "Номер скопирован!",
        duration: 2000,
        color: "accent",
        position: "bottom"
      });
      toast.present();      
    })
  }

  async openBarcode() {
    const modal = await this.modalCtrl.create({
      component: BarcodeModalComponent,
      componentProps: {order: this.order_info.deal},
      initialBreakpoint:0.5,
      mode:'ios',
      breakpoints: [0.3,0.5,0.7,0.9],

    });
    modal.present();
  }  


  async openPreview() {

    const loading = await this.loadingCtrl.create({
      message: 'Подождите...',
      mode: "ios"
    });
    loading.present();
    const modal = await this.modalCtrl.create({
      component: ImageZoomPage,
      componentProps: { img: this.order_info.deal_detail.IMAGE },
      cssClass: 'transparent-modal'
    });
    loading.dismiss();
    modal.present();
  }

  async openPaymentCheck() {
    
    const modal = await this.modalCtrl.create({
      component: ImageZoomPage,
      componentProps: {img: this.order_info.deal.PAYEMENT_ORDER_IMAGE},
      cssClass: 'transparent-modal'
    });
    modal.present();
  }
  
  async openDeliveryCheck() {
    const modal = await this.modalCtrl.create({
      component: ImageZoomPage,
      componentProps: {img: this.order_info.deal.PAYEMENT_DELIVERY_IMAGE},
      cssClass: 'transparent-modal'
    });
    modal.present();
  }

  async removeCheck(mode:string) {

    const alert = await this.alertController.create({
      header: 'Внимание!',
      message:"Вы действительно хотите удалить прикрепленный файл?",
      mode: "ios",
      cssClass: "delete-alert",
      buttons: [
        {
          text: 'Отмена',
          role: 'cancel',
          handler: () => {
            // ничего
          },
        },
        {
          text: 'Удалить',
          role: 'confirm',
          cssClass: 'alert-button-confirm',
          handler: () => {
            //Удалим чек
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role=='confirm') {
      this.is_load = false;

      const formData = new FormData();
      formData.append('lead_id', this.order_id);
      formData.append('type', mode);
   
      const url = environment.api_url + 'remove_check.php';    
      this.http.post(url, formData)
      .pipe(
          finalize(() => {
            this.userService.reloadLeads$.next(true);
            this.userService.loadLead(this.order_id).then( response =>{
              this.order_info = response;
              console.log(this.order_info);
              this.is_load = true;
            })  
          })
      )
      .subscribe(async res => {
          console.log("send result:");
          console.log(res);
      });   


     
    }
    //this.roleMessage = `Dismissed with role: ${role}`;    

  }


  async openPayment2(mode:string) {

    if (mode=="delivery") {

      const modal = await this.modalCtrl.create({
        component: PaymenDeliveryInstructionComponent,
        mode: "ios",
        breakpoints: [0.60,0.70,0.99],
        initialBreakpoint: 0.70,         
        componentProps: {order_id: this.order_info.deal.ID,deal:this.order_info.deal}
      });
      modal.present();
      const { role, data } = await modal.onWillDismiss(); 
      console.log('role');
      console.log(role);    
      console.log(data);  
      if (role === 'refresh') {
        this.is_load = false;
        this.userService.loadLead(this.order_id).then( response =>{
          this.order_info = response;
          console.log(this.order_info);
          this.is_load = true;
        })        
      }      
    } else {
      const modal = await this.modalCtrl.create({
        component: PaymentInstructionComponent,
        mode: "ios",
        breakpoints: [0.60,0.70,0.99],
        initialBreakpoint: 0.70, 
        componentProps: {order_id: this.order_info.deal.ID, order_info:this.order_info}
      });
      modal.present();     
      const { role, data } = await modal.onWillDismiss();  
      console.log('role');
      console.log(role);
      console.log(data);
      if (role === 'refresh') {
        this.is_load = false;
        this.userService.loadLead(this.order_id).then( response =>{
          this.order_info = response;
          console.log(this.order_info);
          this.is_load = true;
        })        
      }        
    }
  }


  
  sendReview() {
    this.userService.addReview(this.store_id,this.review_stars,this.review_name,this.review_text,this.order_id, this.review_share).then(async res=>{
      this.order_info.deal.REVIEW={};
      this.order_info.deal.REVIEW.visible = '0';
      this.order_info.deal.REVIEW.like = this.review_stars;
      this.order_info.deal.REVIEW.text = this.review_text;
      this.order_info.deal.REVIEW.bitrix_user_name = this.review_name;
      this.order_info.deal.REVIEW.created_at = new Date();
      this.show_review = false;

      const toast = await this.toastController.create({
        message: res.message,
        duration: 3500,
        position: "bottom",
        color: 'accent'
      });
      
      await toast.present();
    });
  }
  
}

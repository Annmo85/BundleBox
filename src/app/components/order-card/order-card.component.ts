import { Component, Input, OnInit } from '@angular/core';
import { NavController,PopoverController } from '@ionic/angular';
import {HelperPopoverComponent} from '../../components/helper-popover/helper-popover.component';
import {PaymenDeliveryInstructionComponent} from '../../components/paymen-delivery-instruction/paymen-delivery-instruction.component';
import {PaymentInstructionComponent} from '../../components/payment-instruction/payment-instruction.component';
import { ModalController, ToastController } from '@ionic/angular';
import { UserService } from '../../services/user.service';
import {OrderPage} from '../../tabs/account/order/order.page';

@Component({
  selector: 'app-order-card',
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss'],
})
export class OrderCardComponent  implements OnInit {

  bgcolor:string = "";

  public _order:any = null;

  @Input() set order (val:any) {
    this._order = val;
  }

 public _link:any = null;
  @Input() set link (val:any) {
    this._link = val;
  }

  constructor(private userService:UserService, private modalCtrl: ModalController, private toastController:ToastController,private nav:NavController,private popoverController: PopoverController) { }

  ngOnInit() {

    if (this._order.STAGE === "Отправлено магазином") this.bgcolor = "#FCF2CF;";
    else if (this._order.STAGE === "Ожидает выкупа") this.bgcolor = "#FADBEB;";
    else if (this._order.STAGE === "Оплатите заказ") this.bgcolor = "#FFA39B;";
    else if (this._order.STAGE === "Оплачено") this.bgcolor = "#DAE1F1;";
    else if (this._order.STAGE === "Получено на складе") this.bgcolor = "#F8DA78;";
    else if (this._order.STAGE === "Посылка отправлена") this.bgcolor = "#CBE0B9;";
    else if (this._order.STAGE === "Оплатите доставку") this.bgcolor = "#FFA39B;";
    else if (this._order.STAGE === "Доставка оплачена") this.bgcolor = "#DAE1F1;";
    else if (this._order.STAGE === "Получите заказ") this.bgcolor = "#FFA39B;";
    else if (this._order.STAGE === "Заказ завершён") this.bgcolor = "#ADB9C7;";
    else if (this._order.STAGE === "Заказ завершен") this.bgcolor = "#ADB9C7;";

  }


  async openItem() {
    const modal = await this.modalCtrl.create({
      component: OrderPage,
      componentProps: {order_id: this._order.ID, store_id: this._order.STORE_ID}
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      console.log(data);
      this._order.REVIEW = data;
    }
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
      componentProps: {order_id: this._order.ID}
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
      componentProps: {order_id: this._order.ID, order_info:this._order}
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

}

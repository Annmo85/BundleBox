import { Component, Input, OnInit } from '@angular/core';
import { NavController,PopoverController } from '@ionic/angular';
import {HelperPopoverComponent} from '../../components/helper-popover/helper-popover.component';
import {PaymenDeliveryInstructionComponent} from '../../components/paymen-delivery-instruction/paymen-delivery-instruction.component';
import {PaymentInstructionComponent} from '../../components/payment-instruction/payment-instruction.component';
import { ModalController, ToastController } from '@ionic/angular';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-order-card',
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss'],
})
export class OrderCardComponent  implements OnInit {

  public _order:any = null;

  @Input() set order (val:any) {
    this._order = val;
  }

 public _link:any = null;
  @Input() set link (val:any) {
    this._link = val;
  }

  constructor(private userService:UserService, private modalCtrl: ModalController, private toastController:ToastController,private nav:NavController,private popoverController: PopoverController) { }

  ngOnInit() {}


  async openItem() {
    this.nav.navigateForward(["/tabs/account/order",this._order.ID])
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

}

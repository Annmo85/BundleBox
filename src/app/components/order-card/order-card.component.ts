import { Component, Input, OnInit } from '@angular/core';
import { NavController,PopoverController } from '@ionic/angular';
import {HelperPopoverComponent} from '../../components/helper-popover/helper-popover.component';

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

  constructor(private nav:NavController,private popoverController: PopoverController) { }

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

}

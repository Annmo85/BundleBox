import { Component, Input, OnInit } from '@angular/core';
import { NavController,PopoverController } from '@ionic/angular';
import {HelperPopoverComponent} from '../../components/helper-popover/helper-popover.component';
import {PaymenDeliveryInstructionComponent} from '../../components/paymen-delivery-instruction/paymen-delivery-instruction.component';
import {PaymentInstructionComponent} from '../../components/payment-instruction/payment-instruction.component';
import { ModalController, ToastController } from '@ionic/angular';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-collapsed-order',
  templateUrl: './collapsed-order.component.html',
  styleUrls: ['./collapsed-order.component.scss'],
})
export class CollapsedOrderComponent  implements OnInit {

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

  }
}

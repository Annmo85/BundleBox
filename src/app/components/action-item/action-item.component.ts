import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { MakeOrderModalComponent } from 'src/app/components/make-order-modal/make-order-modal.component';

@Component({
  selector: 'app-action-item',
  templateUrl: './action-item.component.html',
  styleUrls: ['./action-item.component.scss'],
})
export class ActionItemComponent  implements OnInit {

  public _order:any = null;

  public minuts: number = 0;
  public days: number = 0;
  public hours: number = 0;
  public seconds: number = 0;
  public has_timer: boolean = false;
  private end_date: any;

  @Input() set order (val:any) {
    this._order = val;
  }

  public _link:any = "";
  @Input() set link (val:any) {
    this._link = val;
  }

  constructor(private nav: NavController, private modalCtrl: ModalController, public popoverController: PopoverController) { }

  ngOnInit() {

    let date = Date.now();
    if (this._order.end_date!= null) {
      this.has_timer = true;
      var arr = this._order.end_date.split(/[- :]/);
      this.end_date = new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]);
      //this.end_date = new Date(this._order.end_date);
      setInterval( ()=>this.calculateTimer(), 100);
    }

  }


  calculateTimer() {
    let current_date = new Date();
    //console.log(current_date.toLocaleString());
    //console.log(this.end_date.toLocaleString());
    let diff_date = new Date(this.end_date.getTime() - current_date.getTime());
    //console.log(diff_date.toLocaleString());
    this.days = diff_date.getUTCDate()-1;
    this.hours = diff_date.getHours();
    this.minuts = diff_date.getMinutes();
    this.seconds = diff_date.getSeconds();
    
  }


  async openItem2() {
    if (this._link!="") {
      this.nav.navigateForward([this._link]);
    }
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

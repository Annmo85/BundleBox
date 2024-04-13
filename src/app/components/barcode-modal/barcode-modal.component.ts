import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-barcode-modal',
  templateUrl: './barcode-modal.component.html',
  styleUrls: ['./barcode-modal.component.scss'],
})
export class BarcodeModalComponent  implements OnInit {
  public order:any;
  constructor(private modalCtrl:ModalController) { }

  ngOnInit() {
    console.log(this.order);

    JsBarcode("#barcode", this.order.BARCODE, {
      lineColor: "#000",
      width:3,
      height:100,      
    });    
  }
  close() {
    this.modalCtrl.dismiss();
  }
}

import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-delivery-service-sheet',
  templateUrl: './delivery-service-sheet.component.html',
  styleUrls: ['./delivery-service-sheet.component.scss'],
})
export class DeliveryServiceSheetComponent {

  constructor(private modalCtrl: ModalController) { }

  select(service: 'sova' | 'ozon') {
    this.modalCtrl.dismiss(service);
  }
}

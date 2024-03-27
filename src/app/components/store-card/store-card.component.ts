import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController, NavController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { StoreItemPage } from '../../tabs/stores/store-item/store-item.page';
import {StoreModalComponent} from '../store-modal/store-modal.component';

@Component({
  selector: 'app-store-card',
  templateUrl: './store-card.component.html',
  styleUrls: ['./store-card.component.scss'],
})
export class StoreCardComponent implements OnInit {

  @Input() store: any = null;

  constructor(private nav: NavController, private modalCtrl: ModalController, public sanitizer: DomSanitizer) { }

  ngOnInit() { }

  async openItem() {
    const modal = await this.modalCtrl.create({
      component: StoreModalComponent,
      componentProps: { store_item: this.store }
    });
    modal.present();
  }

}

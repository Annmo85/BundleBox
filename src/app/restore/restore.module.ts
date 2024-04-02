import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { RestorePageRoutingModule } from './restore-routing.module';
import {CommonComponent} from '../components/common/CommonComponent';
import { MaskitoDirective } from '@maskito/angular';
import { RestorePage } from './restore.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaskitoDirective,
    CommonComponent,
    RestorePageRoutingModule
  ],
  declarations: [RestorePage]
})
export class RestorePageModule {}

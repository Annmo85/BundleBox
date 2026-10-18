import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SelectPvzOzonPageRoutingModule } from './select-pvz-ozon-routing.module';
import { CommonComponent } from '../../../components/common/CommonComponent';
import { SelectPvzOzonPage } from './select-pvz-ozon.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CommonComponent,
    IonicModule,
    ScrollingModule,
    SelectPvzOzonPageRoutingModule
  ],
  declarations: [SelectPvzOzonPage]
})
export class SelectPvzOzonPageModule {}

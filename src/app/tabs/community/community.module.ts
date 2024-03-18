import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { CommunityPageRoutingModule } from './community-routing.module';
import {CommonComponent} from '../../components/common/CommonComponent'
import { CommunityPage } from './community.page';

@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommonComponent,
    CommunityPageRoutingModule
  ],
  declarations: [CommunityPage]
})
export class CommunityPageModule {}

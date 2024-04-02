import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { CodeInputModule } from 'angular-code-input';
import { RegistrationPageRoutingModule } from './registration-routing.module';
import {CommonComponent} from '../components/common/CommonComponent';
import { MaskitoDirective } from '@maskito/angular';
import { RegistrationPage } from './registration.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaskitoDirective,
    CodeInputModule,
    CommonComponent,
    RegistrationPageRoutingModule
  ],
  declarations: [RegistrationPage]
})
export class RegistrationPageModule {}

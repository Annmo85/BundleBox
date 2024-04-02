import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonInput, ModalController, NavController, ToastController } from '@ionic/angular';
import {UserService} from '../services/user.service';
import { LoadingController } from '@ionic/angular';
import { MaskitoElementPredicate, MaskitoOptions } from '@maskito/core';

@Component({
  selector: 'app-restore',
  templateUrl: './restore.page.html',
  styleUrls: ['./restore.page.scss'],
})
export class RestorePage implements OnInit {


  ionicForm: FormGroup | undefined;
  @ViewChild('phone') phone! : IonInput;
  @ViewChild('password') password! : IonInput;
  phone_model: string = "";

  phone_error:string = "";
  pwd_error:string = "";
  error_response:string = "";

  readonly maskPredicate: MaskitoElementPredicate = async (el) => (el as HTMLIonInputElement).getInputElement();
  readonly phoneMask: MaskitoOptions = {
    mask: ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/],
  };


  constructor(private loadingCtrl: LoadingController, private userService:UserService, private router: Router, private nav:NavController, private modalController: ModalController, private toastController: ToastController, public formBuilder: FormBuilder) { }



  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.ionicForm = this.formBuilder.group({
      phone: ['', [Validators.required]],
    })    
  }

  async submitForm() {
    this.phone_error = "";
    this.error_response ="";
    console.log(this.ionicForm!.value);
    let phone = this.ionicForm!.value.phone;

    if (phone=='') {
      this.phone_error = "Телефон не может быть пустым!";
    }

    if (phone!='') {

      const loading = await this.loadingCtrl.create({
        message: 'Подождите...',
        mode:"ios"
      });
      loading.present();

      this.userService.resetPassword(phone).then(async response=>{

        loading.dismiss();        
        if (response.status) {
          this.error_response = response.message;
          const toast = await this.toastController.create({
            message: this.error_response,
            duration: 2000,
            color: "blue"
          });
          toast.present();          
          this.nav.navigateRoot(['/start']);          
        } else {
          const toast = await this.toastController.create({
            message: response.message,
            duration: 2000,
            color: "danger"
          });
          toast.present();          
        }


      }).catch(err=>{
        console.log("login.ts this.userService.login error:");
        console.log(err);
        loading.dismiss();
      });
    }

  }


  pwdSetFocus() { 
    this.password.setFocus();
  }

  back() {

    this.nav.navigateBack(['/login']);
  }
}

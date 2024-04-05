import { Component, OnInit, ViewChild } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonInput, ModalController, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import {UserService} from '../services/user.service';
import {UslPageComponent} from '../components/usl-page/usl-page.component';
import { MaskitoElementPredicate, MaskitoOptions } from '@maskito/core';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {


  ionicForm: FormGroup | undefined;
  @ViewChild('phone') phone! : IonInput;
  @ViewChild('password') password! : IonInput;
  phone_model: string = "";

  phone_error:string = "";
  pwd_error:string = "";
  error_response:string = "";
  usl_error:string = "";

  readonly maskPredicate: MaskitoElementPredicate = async (el) => (el as HTMLIonInputElement).getInputElement();
  readonly phoneMask: MaskitoOptions = {
    mask: ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/],
  };

  constructor(private loadingCtrl: LoadingController, private userService:UserService, private router: Router, private nav:NavController, private modalController: ModalController, private toastController: ToastController,  public formBuilder: FormBuilder) { }

  ngOnInit() {
    this.buildForm();
  }


  buildForm() {
    this.ionicForm = this.formBuilder.group({
      phone: ['', [Validators.required]],
      password: ['', [Validators.required]],
      usl: [true, [Validators.required]]
    })    
  }


  updateWithMask(event:any) {
    //this.ionicForm.controls.phone.setValue(this.maskPipe.transform(event.currentTarget.value, '(000) 000-00-00'));
  }


  async submitForm() {
    this.phone_error = "";
    this.pwd_error = "";
    this.error_response ="";
    this.usl_error ="";
    console.log(this.ionicForm!.value);
    let phone = this.ionicForm!.value.phone;
    let password = this.ionicForm!.value.password;
    let usl = this.ionicForm!.value.usl;

    if (phone=='') {
      this.phone_error = "Телефон не может быть пустым!";
    }
    if (password=='') {
      this.pwd_error = "Пароль не может быть пустым!";
    }
    if (!usl) {
      this.usl_error = "Вы не согласились с условиями!";
    }

    if (phone!='' && password !='' && usl) {

      const loading = await this.loadingCtrl.create({
        message: 'Подождите...',
        mode:"ios"
      });
      loading.present();

      this.userService.login(phone,password).then(async response=>{

        loading.dismiss();        
        if (response.error) {
          this.error_response = response.message;
          const toast = await this.toastController.create({
            message: this.error_response,
            duration: 2000,
            color: "alert"
          });
          toast.present();
        } else {
          this.nav.navigateRoot(['/tabs/main']);
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


  async openUsl() {
    const modal = await this.modalController.create({
      component: UslPageComponent,
    });
    modal.present();
  }

}

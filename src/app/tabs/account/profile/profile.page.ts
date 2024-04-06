import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonInput, ModalController, NavController, ToastController } from '@ionic/angular';
import {UserService} from '../../../services/user.service';
import { LoadingController } from '@ionic/angular';
import { MaskitoElementPredicate, MaskitoOptions } from '@maskito/core';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  ionicForm!: FormGroup;
  @ViewChild('phone') phone! : IonInput ;
  @ViewChild('password') password! : IonInput;
  @ViewChild('confirm') confirm! : IonInput;
  @ViewChild('name') name! : IonInput;
  @ViewChild('email') email! : IonInput;
  @ViewChild('last_name') last_name! : IonInput;
  @ViewChild('codeInput') codeInput! : ElementRef;
  phone_model: string = "";

  phone_error:string = "";
  name_error:string = "";
  pwd_error:string = "";
  confirm_error:string = "";
  error_response:string = "";
  usl_error:string = "";
  city_error:string = "";  

  isCityModalOpen:boolean = false;
  is_load:boolean = false;

  cities:any[] = [];
  cities_filtered:any[] = [];
  city:string = "";
  filtered: boolean = false;
  profile:any;


  readonly maskPredicate: MaskitoElementPredicate = async (el) => (el as HTMLIonInputElement).getInputElement();
  readonly phoneMask: MaskitoOptions = {
    mask: ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/],
  };

  constructor( private ref: ChangeDetectorRef, private loadingCtrl: LoadingController, private userService:UserService, private router: Router, private nav:NavController, private modalController: ModalController, private toastController: ToastController, public formBuilder: FormBuilder) { }


  ngOnInit() {

    Promise.all([this.userService.getProfile(),this.userService.getCities()]).then(res=>{
      this.profile = res[0].user;
      this.cities = res[1].cities;
      this.city = this.profile.CITY_VALUE?this.profile.CITY_VALUE:'';
      this.buildForm();
      this.is_load = true;
    })

  }
  buildForm() {
    this.ionicForm = this.formBuilder.group({
      name: [this.profile.NAME, [Validators.required]],
      last_name: [this.profile.LAST_NAME, [Validators.required]],
      email: [this.profile.EMAIL, [Validators.required,Validators.email]],
      city: [this.profile.CITY_VALUE, [Validators.required]],
      street: [this.profile.STREET_VALUE],
      dom: [this.profile.DOM_VALUE],
      kv: [this.profile.KV_VALUE],
      index: [this.profile.INDEX_VALUE],
    })    
  }


  pwdSetFocus() { 
    this.password.setFocus();
  }

  setFocus(control:IonInput) {
    control.setFocus();
  }


  async submitForm() {
    console.log(this.ionicForm.value);

    const loading = await this.loadingCtrl.create({
      message: 'Подождите...',
      mode: "ios"
    });
    loading.present();
        this.userService.updateAddress(this.ionicForm.value['index'],this.ionicForm.value['city'],this.ionicForm.value['street'],this.ionicForm.value['dom'],this.ionicForm.value['kv']).then(async response=>{

          if (response.error) {
            this.error_response = response.message;
            const toast = await this.toastController.create({
              message: this.error_response,
              duration: 2000,
              color: "alert"
            });
            loading.dismiss();
            toast.present();        
          } else {
              this.userService.updateProfile(this.ionicForm.value['name'],this.ionicForm.value['last_name'],this.ionicForm.value['email']).then(async response=>{
                if (response.error) {
                  this.error_response = response.message;
                  const toast = await this.toastController.create({
                    message: this.error_response,
                    duration: 2000,
                    color: "alert"
                  });
                  loading.dismiss();
                  toast.present(); 
                } else {
                  loading.dismiss();
                  const toast = await this.toastController.create({
                    message: "Данные успешно обновлены",
                    duration: 2000,
                    color: "accent"
                  });
                  toast.present(); 
                  this.nav.back();
                }

              });
          }



        });
  }

  get filteredItems() {
    return this.cities.filter(item => {
      return item.label.toLowerCase().indexOf(this.city.toLowerCase()) > -1;
    });
  }

  onSearchChange(event:any) {
    this.city = event.detail.value;
    this.filtered = true;
  }  

  async setCity(item:any) {
    console.log(item);
    this.city = item.label;
    this.ionicForm.get('city')?.patchValue(this.city);
    this.isCityModalOpen = false;
  }
}

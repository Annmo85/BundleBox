import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonInput, ModalController, NavController, ToastController } from '@ionic/angular';
import {UserService} from '../services/user.service';
import { LoadingController } from '@ionic/angular';
import { MaskitoElementPredicate, MaskitoOptions } from '@maskito/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {

  ionicForm!: FormGroup;
  ionicForm1!: FormGroup;
  @ViewChild('phone') phone! : IonInput ;
  @ViewChild('password') password! : IonInput;
  @ViewChild('confirm') confirm! : IonInput;
  @ViewChild('name') name! : IonInput;
  @ViewChild('email') email! : IonInput;
  @ViewChild('last_name') last_name! : IonInput;
  @ViewChild('codeInput') codeInput! : ElementRef;
  
  phone_model: string = "";
  
  current_segment: string = "phone";

  phone_error:string = "";
  name_error:string = "";
  pwd_error:string = "";
  confirm_error:string = "";
  error_response:string = "";
  usl_error:string = "";
  city_error:string = "";

  step: number  = 1;
  timer: number  = 30;
  timeout: any;
  sms_code: any;
  isCityModalOpen:boolean = false;

  cities:any[] = [];
  cities_filtered:any[] = [];
  city:string = "";
  filtered: boolean = false;

  readonly maskPredicate: MaskitoElementPredicate = async (el) => (el as HTMLIonInputElement).getInputElement();
  readonly phoneMask: MaskitoOptions = {
    mask: ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/],
  };

  constructor( private ref: ChangeDetectorRef, private loadingCtrl: LoadingController, private userService:UserService, private router: Router, private nav:NavController, private modalController: ModalController, private toastController: ToastController, public formBuilder: FormBuilder) { }


  ngOnInit() {
    this.userService.getCities().then(res=>{
      console.log("cities", res);
      this.cities = res.cities;
    })    
    this.buildForm();
  }

  buildForm() {
    this.ionicForm = this.formBuilder.group({
      phone: ['', [Validators.required]],
      confirm: ['', [Validators.required]],
      name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required,Validators.email]],
      password: ['', [Validators.required]],
      city: ['', [Validators.required]],
      usl: [false, [Validators.required]]
    }) 
    this.ionicForm1 = this.formBuilder.group({
      phone: [''],
      confirm: ['', [Validators.required]],
      name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required,Validators.email]],
      password: ['', [Validators.required]],
      city: ['', [Validators.required]],
      usl: [false, [Validators.required]]
    })    
  }


  doResend() {
    let phone = this.ionicForm.value.phone;
    this.userService.sendSms(phone).then( async res=>{

      if (!res.status) {
        this.step = 1;
        const toast = await this.toastController.create({
          message: res.message,
          duration: 2000,
          color: "danger"
        });
        toast.present();
      }
      
      this.timer = 30;
      this.timeout = setInterval(()=>{
        this.timer--; 
        if (this.timer<=0) clearInterval(this.timeout);
        this.ref.detectChanges();
      },1000);
    });
  } 

  doResend1() {
    let email = this.ionicForm1.value.email;
    this.userService.sendEmail(email).then( async res=>{

      if (!res.status) {
        this.step = 1;
        const toast = await this.toastController.create({
          message: res.message,
          duration: 2000,
          color: "danger"
        });
        toast.present();
      }
      
      this.timer = 30;
      this.timeout = setInterval(()=>{
        this.timer--; 
        if (this.timer<=0) clearInterval(this.timeout);
        this.ref.detectChanges();
      },1000);
    });
  }  

  onCodeChanged(ev:any) {
    console.log("onCodeChanged");
    console.log(ev)
    this.sms_code = ev;
  }


  onCodeCompleted(ev:any) {
    console.log("onCodeCompleted");
    console.log(ev)
    this.sms_code = ev;
    this.registerUser();
  }

  async registerUser() {
    const loading = await this.loadingCtrl.create({
      message: 'Подождите...',
      mode:'ios'
    });
    loading.present();  

    
    let phone = this.ionicForm.value.phone;
    let password = this.ionicForm.value.password;
    let confirm = this.ionicForm.value.confirm;
    let name = this.ionicForm.value.name;
    let city = this.ionicForm.value.city;
    let email = this.ionicForm.value.email;
    let last_name = this.ionicForm.value.last_name;
    let mode = "phone";

    if (this.current_segment=='email') {
      phone = this.ionicForm1.value.phone;
      password = this.ionicForm1.value.password;
      confirm = this.ionicForm1.value.confirm;
      name = this.ionicForm1.value.name;
      city = this.ionicForm1.value.city;
      email = this.ionicForm1.value.email;
      last_name = this.ionicForm1.value.last_name;    
      mode = "email";  
    }

    this.userService.createUser(name,last_name,email,password,phone,this.sms_code, city, mode).then( async res => {
      console.log("createUser:");
      console.log(res);
      if (res.error) {
        const toast = await this.toastController.create({
          message: res.message,
          duration: 2000,
          color: "danger"
        });
        toast.present();     
        this.step = 1;   
      } else {
        //Пользователь создан
        localStorage.setItem(environment.prefix + 'user_phone',res.phone);
        localStorage.setItem(environment.prefix + 'user_password',password);
        localStorage.setItem(environment.prefix + 'user_id',res.result.result);
        localStorage.setItem(environment.prefix + 'user_name',name);
        localStorage.setItem(environment.prefix + 'user_lastname',last_name);
        localStorage.setItem(environment.prefix + 'user_city',city);
        this.nav.navigateBack(['/start']);
      }
    })

    loading.dismiss();
  }  


  async submitForm() {
    this.confirm_error = "";
    this.phone_error = "";
    this.pwd_error = "";
    this.error_response ="";
    this.usl_error ="";
    console.log(this.ionicForm.value);
    let phone = this.ionicForm.value.phone;
    let city = this.ionicForm.value.city;
    let password = this.ionicForm.value.password;
    let confirm = this.ionicForm.value.confirm;
    let name = this.ionicForm.value.name;
    let email = this.ionicForm.value.email;
    let usl = this.ionicForm.value.usl;

    if (phone=='') {
      this.phone_error = "Телефон не может быть пустым!";
    }
    if (name=='') {
      this.name_error = "Имя не может быть пустым!";
    }
    if (password=='') {
      this.pwd_error = "Пароль не может быть пустым!";
    }
    if (email=='') {
      this.confirm_error = "Email не может быть пустым!";
    }    
    if (city=='') {
      this.city_error = "Вы не указали ваш город или регион!";
    }
    if (confirm=='') {
      this.confirm_error = "Пароль не может быть пустым!";
    }
    if (confirm!='' && password!='' && password!=confirm) {
      this.confirm_error = "Пароль не совпадает!";
    }
    if (!usl) {
      this.usl_error = "Вы не согласились с условиями!";
    }
    if (phone!='' && name!='' && password !='' && email !='' && confirm ==password && usl) {

      const loading = await this.loadingCtrl.create({
        message: 'Подождите...',
        mode: 'ios'
      });
      loading.present();      

      //Отправим смс
      this.userService.sendSms(phone).then( async res=>{

        if (!res.status) {
          this.nav.navigateBack(['/login']);
          const toast = await this.toastController.create({
            message: res.message,
            duration: 2000,
            color: "danger"
          });
          toast.present();
        }

        loading.dismiss();
        this.timer = 30;
        this.timeout = setInterval(()=>{
          this.timer--; 
          if (this.timer<=0) clearInterval(this.timeout);
          this.ref.detectChanges();
        },1000);
        this.step=2;
        this.codeInput.nativeElement.setFocus();
      });

    }

  }


  pwdSetFocus() { 
    this.password.setFocus();
  }

  setFocus(control:IonInput) {
    control.setFocus();
  }

  back() {

    this.nav.navigateBack(['/login']);
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


  changeForm(ev:any) {
    this.current_segment = ev.detail.value;
  }




  async submitForm1() {
    this.confirm_error = "";
    this.phone_error = "";
    this.pwd_error = "";
    this.error_response ="";
    this.usl_error ="";
    console.log(this.ionicForm1.value);
    let phone = this.ionicForm1.value.phone;
    let city = this.ionicForm1.value.city;
    let password = this.ionicForm1.value.password;
    let confirm = this.ionicForm1.value.confirm;
    let name = this.ionicForm1.value.name;
    let email = this.ionicForm1.value.email;
    let usl = this.ionicForm1.value.usl;

    if (phone=='') {
      this.phone_error = "Телефон не может быть пустым!";
    }
    if (name=='') {
      this.name_error = "Имя не может быть пустым!";
    }
    if (password=='') {
      this.pwd_error = "Пароль не может быть пустым!";
    }
    if (city=='') {
      this.city_error = "Вы не указали ваш город или регион!";
    }
    if (confirm=='') {
      this.confirm_error = "Пароль не может быть пустым!";
    }
    if (email=='') {
      this.confirm_error = "Email не может быть пустым!";
    }
    if (confirm!='' && password!='' && password!=confirm) {
      this.confirm_error = "Пароль не совпадает!";
    }
    if (!usl) {
      this.usl_error = "Вы не согласились с условиями!";
    }
    if (phone!='' && name!='' && password !='' && email !='' && confirm ==password && usl) {

      const loading = await this.loadingCtrl.create({
        message: 'Подождите...',
        mode: 'ios'
      });
      loading.present();      

      //Отправим смс
      this.userService.sendEmail(email).then( async res=>{

        if (!res.status) {
          this.nav.navigateBack(['/login']);
          const toast = await this.toastController.create({
            message: res.message,
            duration: 2000,
            color: "danger"
          });
          toast.present();
        }

        loading.dismiss();
        this.timer = 30;
        this.timeout = setInterval(()=>{
          this.timer--; 
          if (this.timer<=0) clearInterval(this.timeout);
          this.ref.detectChanges();
        },1000);
        this.step=2;
        this.codeInput.nativeElement.setFocus();
      });

    }

  }  
}

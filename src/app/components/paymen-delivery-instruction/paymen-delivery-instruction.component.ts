import { Component, OnInit } from '@angular/core';
import { Clipboard } from '@capacitor/clipboard';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Platform } from "@ionic/angular";
import { UserService } from '../../services/user.service';
const IMAGE_DIR = 'stored-images';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import {OfertaComponent} from '../../components/oferta/oferta.component';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-paymen-delivery-instruction',
  templateUrl: './paymen-delivery-instruction.component.html',
  styleUrls: ['./paymen-delivery-instruction.component.scss'],
})
export class PaymenDeliveryInstructionComponent  implements OnInit {


  public order_id: any;
  deal: any;

  intro_text: any = "";
  instruction_text: any = "";
  instruction_text2: any = "";
  instruction_text3: any = "";
  instruction_text4: any = "";
  instruction_online_text: any = "";
  lines: any = [];

  constructor(private modalController: ModalController, private http: HttpClient, private plt: Platform, private loadingCtrl: LoadingController, private toastController: ToastController, private userService: UserService, private modalCtrl: ModalController) {
    
    
    this.userService.getPaymentsInfoEvents().subscribe(async res => {
      console.log("getPaymentsInfoEvents subscription", res);

      if (!res) {
        let res1 = await this.userService.loadNews();
        console.log("getPaymentsInfoEvents subscription1", res1);
      } else {
        this.intro_text = res.delivery_payment_information.intro_text;
        this.instruction_text = res.delivery_payment_information.instruction_text;
        this.instruction_text2 = res.delivery_payment_information.instruction_text2;
        this.instruction_text3 = res.delivery_payment_information.instruction_text3;
        this.instruction_text4 = res.delivery_payment_information.instruction_text4;
        this.instruction_online_text = res.delivery_payment_information.instruction_online_text;
        this.lines = res.delivery_payment_information.cards;

      }

    })
  }

  ngOnInit() { }

  close() {
    this.modalCtrl.dismiss();
  }

  copyToClip(phone:string) {
    Clipboard.write({string:phone}).then(async res=>{
      console.log(res);
      const toast = await this.toastController.create({
        message: "Номер скопирован!",
        duration: 2000,
        color: "accent",
        position: "bottom"
      });
      toast.present();      
    })
  }


  async sendConfirmImage() {

    Filesystem.readdir({
      path: IMAGE_DIR,
      directory: Directory.Data,
    }).then(result => {
      console.log("readed files:");
      console.log(result);
    },
      async (err) => {
        // Folder does not yet exists!
        await Filesystem.mkdir({
          path: IMAGE_DIR,
          directory: Directory.Data,
        });
      }
    ).then(_ => {
      
  });    

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      promptLabelCancel: 'Отмена',
      promptLabelHeader: 'Взять изображение',
      promptLabelPhoto: 'Из галлереи',
      promptLabelPicture: 'С камеры',
      source: CameraSource.Prompt // Camera, Photos or Prompt!
    });

    if (image) {
        console.log("Image save:");
        console.log(image);
        //await this.saveImage(image);

        const formData = new FormData();
        const response = await fetch(image.webPath!);
        const blob = await response.blob();        
        formData.append('file', blob, 'check.jpg');
        formData.append('lead_id', this.order_id);
        formData.append('type', "delivery");
        const loading = await this.loadingCtrl.create({
          message: 'Загружаем изображение...',
          mode: "ios",
        });
        await loading.present();    
        const url = environment.api_url + 'upload_check.php';    
        this.http.post(url, formData)
        .pipe(
            finalize(() => {
                loading.dismiss();
            })
        )
        .subscribe(async (res:any) => {
            console.log("send result:");
            console.log(res);
            if (res['success']) {
                const toast = await this.toastController.create({
                  message: res['message'],
                  duration: 4000,
                  color: "accent",
                  icon:"checkmark-outline",
                  position: "bottom"
                });
                toast.present();          
                this.modalCtrl.dismiss(null,'refresh'); 
                this.userService.leadChange.next({});
            } else {
                const toast = await this.toastController.create({
                  message: "Во время загрузки произошла ошибка!",
                  duration: 4000,
                  color: "danger",
                  position: "bottom",
                  icon:"alert-circle-outline",
                });
                toast.present();                    
            }
        });        

    }
  }

    // Create a new file from a capture image
    async saveImage(photo: Photo) {
      const base64Data = await this.readAsBase64(photo);
   
      const fileName = new Date().getTime() + '.jpeg';
      const savedFile = await Filesystem.writeFile({
          path: IMAGE_DIR+'/'+fileName,
          data: base64Data,
          directory: Directory.Data
      });
   
      // Reload the file list
      // Improve by only loading for the new image and unshifting array!
      //column.values[i]=photo.webPath;
      //this.database_form_{$page_id}_{$component_id}.value[column.id+'_'+i]=base64Data;        
      console.log(base64Data);


  } 
  
    // https://ionicframework.com/docs/angular/your-first-app/3-saving-photos
    private async readAsBase64(photo: Photo) {
      if (this.plt.is('hybrid')) {
          const file = await Filesystem.readFile({
              path: photo.path!
          });
   
          return file.data;
      }
      else {
          // Fetch the photo, read as a blob, then convert to base64 format
          const response = await fetch(photo.webPath!);
          const blob = await response.blob();
   
          return await this.convertBlobToBase64(blob) as string;
      }
  }  

  // Helper function
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
      const reader = new FileReader;
      reader.onerror = reject;
      reader.onload = () => {
          resolve(reader.result);
      };
      reader.readAsDataURL(blob);
  });

  async openOferta(event:any) {
    if (event.target.tagName=="A") {
      const modal = await this.modalCtrl.create({
        component: OfertaComponent,
        componentProps: {deal:{ID:"________",DATE:"________"}}
      });
      modal.present();
    }
  }


  async gotoOnlinePayment() {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    await Browser.open({ url: 'https://bundlebox.ru/mobile/widget/delivery.php?id='+user_id});
    this.close();
  }
}

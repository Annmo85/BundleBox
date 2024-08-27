import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { Clipboard } from '@capacitor/clipboard';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
const IMAGE_DIR = 'stored-images';

export interface OrderFormItem {
  url: string;
  attrubutes: string;
  qty: number;
  price: string;
  additional?: string;
  images_count: number;
  images: any[];
  images_b64: any[];
  images_names: string[];
}

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss'],
})
export class OrderFormComponent implements OnInit {


  cards: OrderFormItem[] = [{
    url: "",
    attrubutes: "",
    qty: 1,
    price: "",
    additional: "",
    images: [],
    images_b64: [],
    images_names: [],
    images_count: 0
  }]

  constructor( private toastController: ToastController, private http: HttpClient, private loadingCtrl: LoadingController, private alertController: AlertController, public sanitizer: DomSanitizer, private userService: UserService, private modalCtrl: ModalController) { }

  ngOnInit() { }




  close() {
    this.modalCtrl.dismiss();
  }

  async removeCard(card_index:number){
    const alert = await this.alertController.create({
      header: 'Внимание!',
      message: "Вы действительно хотите удалить форму?",
      mode: "ios",
      cssClass: "delete-alert",
      buttons: [
        {
          text: 'Отмена',
          role: 'cancel',
          handler: () => {
            // ничего
          },
        },
        {
          text: 'Удалить',
          role: 'confirm',
          cssClass: 'alert-button-confirm',
          handler: () => {
            //Удалим чек
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role == 'confirm') {
      this.cards.splice(card_index,1);


    }
  }

  add() {
    this.cards.push({
      url: "",
      attrubutes: "",
      qty: 1,
      price: "",
      images: [],
      images_b64: [],
      images_names: [],
      images_count: 0
    })
  }


  async addImage(card: OrderFormItem) {

    console.log("card",card.images);

    //Если директрия для картинок не создана, то создадатим
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
      this.convertBlobToBase64(blob).then(res => {
        card.images.push(blob);
        card.images_b64.push(res);
        card.images_names.push(image.path!);
        console.log("add image to array",card.images_names);
      })
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


  async removeImage(card:OrderFormItem, i: number) {

    const alert = await this.alertController.create({
      header: 'Внимание!',
      message: "Вы действительно хотите удалить прикрепленный файл?",
      mode: "ios",
      cssClass: "delete-alert",
      buttons: [
        {
          text: 'Отмена',
          role: 'cancel',
          handler: () => {
            // ничего
          },
        },
        {
          text: 'Удалить',
          role: 'confirm',
          cssClass: 'alert-button-confirm',
          handler: () => {
            //Удалим чек
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role == 'confirm') {
      card.images.splice(i, 1);
      card.images_b64.splice(i, 1);
      card.images_names.splice(i, 1);
      console.log("delete image from array",card.images_names);

    }
  }



  valid(): boolean {
    for (const item of this.cards) {
      // Проверяем, что поле url не является пустой строкой, qty не равен null или undefined, и price не является пустой строкой
      if (!item.url.trim() || item.qty == null || item.price.trim() === '') {
        return false; // Если хотя бы одно из полей не заполнено, возвращаем false
      }
    }
    return true; // Если все элементы массива прошли проверку, возвращаем true
  }



  async send() {

    console.log("cards",this.cards);

    const loading = await this.loadingCtrl.create({
      message: 'Отправляем данные...',
      mode: "ios",
    });
    await loading.present(); 

    let user_id = localStorage.getItem(environment.prefix + 'user_id') || "";
    const formData = new FormData();
    formData.append('user_id', user_id);
    formData.append('count', this.cards.length.toString());

    this.cards.forEach( (card:OrderFormItem, i:number) => {
      formData.append('url_'+i.toString(), card.url);
      formData.append('attrubutes_'+i.toString(), card.attrubutes);
      formData.append('additional_'+i.toString(), card.additional || "");
      formData.append('price_'+i.toString(), card.price);
      formData.append('qty_'+i.toString(), card.qty.toString());
      card.images.forEach((image:Blob, image_index:number) => {
        console.log("formData.append",image_index,card.images_names[image_index]);
        formData.append('image_'+i.toString()+"_"+image_index.toString(), image, card.images_names[image_index].replace(/^.*[\\/]/, ''));
      });
      formData.append('images_count_'+i.toString(), card.images.length.toString());
    });

    const url = environment.api_url + 'upload_order.php';  
    this.http.post(url, formData)
    .pipe(
        finalize(() => {
            loading.dismiss();
        })
    )
    .subscribe(async (res:any) => {
      console.log("upload res",res);
      if (res.success) {
        const toast = await this.toastController.create({
          message: res.message,
          duration: 4000,
          color: "accent",
          icon:"checkmark-outline",
          position: "bottom"
        });
        toast.present();
        this.modalCtrl.dismiss();
      } else {
        const toast = await this.toastController.create({
          message: res.message,
          duration: 4000,
          color: "danger",
          position: "bottom",
          icon:"alert-circle-outline",
        });
        toast.present();
      }
    }, (error:any)=>{
      console.log("upload error",error);
    });
    // loading.dismiss();
  }

}

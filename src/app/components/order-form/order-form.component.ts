import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController, ModalController } from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { Clipboard } from '@capacitor/clipboard';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
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
    images: [],
    images_b64: [],
    images_count: 0
  }]

  constructor(private alertController: AlertController, public sanitizer: DomSanitizer, private userService: UserService, private modalCtrl: ModalController) { }

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
      images_count: 0
    })
  }


  async addImage(card: OrderFormItem) {

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
      card.images.push(blob);
      this.convertBlobToBase64(blob).then(res => {
        card.images.push(blob);
        card.images_b64.push(res);
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


    }
  }



}

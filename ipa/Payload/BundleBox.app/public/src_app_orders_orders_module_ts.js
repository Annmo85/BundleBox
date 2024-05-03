"use strict";
(self["webpackChunkapp"] = self["webpackChunkapp"] || []).push([["src_app_orders_orders_module_ts"],{

/***/ 3866:
/*!******************************************************!*\
  !*** ./src/app/components/common/CommonComponent.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CommonComponent": () => (/* binding */ CommonComponent)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _order_item_order_item_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../order-item/order-item.component */ 8812);
/* harmony import */ var _order_item_loading_order_item_loading_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../order-item-loading/order-item-loading.component */ 3237);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ 124);
/***
 * Общий модуль для подключения остальных модулей
 */




/*import { AppHeaderComponent } from '../app-header/app-header.component';
import { SimpleModalComponent } from '../simple-modal/simple-modal.component';
import { ImgModalComponent } from '../img-modal/img-modal.component';
import { ItemCardComponent } from '../item-card/item-card.component';*/


let CommonComponent = class CommonComponent {
};
CommonComponent = (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.NgModule)({
        imports: [
            _angular_common__WEBPACK_IMPORTED_MODULE_4__.CommonModule,
            _angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule
        ],
        declarations: [_order_item_order_item_component__WEBPACK_IMPORTED_MODULE_0__.OrderItemComponent, _order_item_loading_order_item_loading_component__WEBPACK_IMPORTED_MODULE_1__.OrderItemLoadingComponent],
        exports: [_order_item_order_item_component__WEBPACK_IMPORTED_MODULE_0__.OrderItemComponent, _order_item_loading_order_item_loading_component__WEBPACK_IMPORTED_MODULE_1__.OrderItemLoadingComponent],
        providers: []
    })
], CommonComponent);



/***/ }),

/***/ 3237:
/*!*******************************************************************************!*\
  !*** ./src/app/components/order-item-loading/order-item-loading.component.ts ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "OrderItemLoadingComponent": () => (/* binding */ OrderItemLoadingComponent)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _order_item_loading_component_html_ngResource__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./order-item-loading.component.html?ngResource */ 794);
/* harmony import */ var _order_item_loading_component_scss_ngResource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./order-item-loading.component.scss?ngResource */ 516);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 2560);




let OrderItemLoadingComponent = class OrderItemLoadingComponent {
    constructor() { }
    ngOnInit() { }
};
OrderItemLoadingComponent.ctorParameters = () => [];
OrderItemLoadingComponent = (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.Component)({
        selector: 'app-order-item-loading',
        template: _order_item_loading_component_html_ngResource__WEBPACK_IMPORTED_MODULE_0__,
        styles: [_order_item_loading_component_scss_ngResource__WEBPACK_IMPORTED_MODULE_1__]
    })
], OrderItemLoadingComponent);



/***/ }),

/***/ 8812:
/*!***************************************************************!*\
  !*** ./src/app/components/order-item/order-item.component.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "OrderItemComponent": () => (/* binding */ OrderItemComponent)
/* harmony export */ });
/* harmony import */ var _Users_govorkovalexander_Desktop_Zaec_bbox_bbox_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ 1670);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _order_item_component_html_ngResource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./order-item.component.html?ngResource */ 7057);
/* harmony import */ var _order_item_component_scss_ngResource__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./order-item.component.scss?ngResource */ 8610);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ionic/angular */ 3819);
/* harmony import */ var _order_order_page__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../order/order.page */ 6107);







let OrderItemComponent = class OrderItemComponent {
  constructor(modalCtrl) {
    this.modalCtrl = modalCtrl;
    this._order = null;
  }

  set order(val) {
    this._order = val;
  }

  ngOnInit() {}

  openItem() {
    var _this = this;

    return (0,_Users_govorkovalexander_Desktop_Zaec_bbox_bbox_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
      const modal = yield _this.modalCtrl.create({
        component: _order_order_page__WEBPACK_IMPORTED_MODULE_3__.OrderPage,
        componentProps: {
          order_id: _this._order.ID
        }
      });
      modal.present();
    })();
  }

};

OrderItemComponent.ctorParameters = () => [{
  type: _ionic_angular__WEBPACK_IMPORTED_MODULE_4__.ModalController
}];

OrderItemComponent.propDecorators = {
  order: [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_5__.Input
  }]
};
OrderItemComponent = (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__decorate)([(0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.Component)({
  selector: 'app-order-item',
  template: _order_item_component_html_ngResource__WEBPACK_IMPORTED_MODULE_1__,
  styles: [_order_item_component_scss_ngResource__WEBPACK_IMPORTED_MODULE_2__]
})], OrderItemComponent);


/***/ }),

/***/ 8486:
/*!***************************************************************!*\
  !*** ./src/app/components/right-menu/right-menu.component.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RightMenuComponent": () => (/* binding */ RightMenuComponent)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _right_menu_component_html_ngResource__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./right-menu.component.html?ngResource */ 3763);
/* harmony import */ var _right_menu_component_scss_ngResource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./right-menu.component.scss?ngResource */ 4882);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ionic/angular */ 3819);
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/user.service */ 3071);






let RightMenuComponent = class RightMenuComponent {
    constructor(userService, nav, popoverController) {
        this.userService = userService;
        this.nav = nav;
        this.popoverController = popoverController;
    }
    ngOnInit() { }
    logout() {
        this.userService.logout().then(() => {
            this.popoverController.dismiss();
            this.nav.navigateRoot(['start'], { animationDirection: "back" });
        });
    }
};
RightMenuComponent.ctorParameters = () => [
    { type: _services_user_service__WEBPACK_IMPORTED_MODULE_2__.UserService },
    { type: _ionic_angular__WEBPACK_IMPORTED_MODULE_3__.NavController },
    { type: _ionic_angular__WEBPACK_IMPORTED_MODULE_3__.PopoverController }
];
RightMenuComponent = (0,tslib__WEBPACK_IMPORTED_MODULE_4__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.Component)({
        selector: 'app-right-menu',
        template: _right_menu_component_html_ngResource__WEBPACK_IMPORTED_MODULE_0__,
        styles: [_right_menu_component_scss_ngResource__WEBPACK_IMPORTED_MODULE_1__]
    })
], RightMenuComponent);



/***/ }),

/***/ 5674:
/*!*************************************************!*\
  !*** ./src/app/orders/orders-routing.module.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "OrdersPageRoutingModule": () => (/* binding */ OrdersPageRoutingModule)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _orders_page__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./orders.page */ 206);




const routes = [
    {
        path: '',
        component: _orders_page__WEBPACK_IMPORTED_MODULE_0__.OrdersPage
    }
];
let OrdersPageRoutingModule = class OrdersPageRoutingModule {
};
OrdersPageRoutingModule = (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.NgModule)({
        imports: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule.forChild(routes)],
        exports: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule],
    })
], OrdersPageRoutingModule);



/***/ }),

/***/ 4819:
/*!*****************************************!*\
  !*** ./src/app/orders/orders.module.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "OrdersPageModule": () => (/* binding */ OrdersPageModule)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/forms */ 2508);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @ionic/angular */ 3819);
/* harmony import */ var _orders_routing_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./orders-routing.module */ 5674);
/* harmony import */ var _orders_page__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./orders.page */ 206);
/* harmony import */ var _components_common_CommonComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/common/CommonComponent */ 3866);








let OrdersPageModule = class OrdersPageModule {
};
OrdersPageModule = (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.NgModule)({
        imports: [
            _angular_common__WEBPACK_IMPORTED_MODULE_5__.CommonModule,
            _angular_forms__WEBPACK_IMPORTED_MODULE_6__.FormsModule,
            _ionic_angular__WEBPACK_IMPORTED_MODULE_7__.IonicModule,
            _components_common_CommonComponent__WEBPACK_IMPORTED_MODULE_2__.CommonComponent,
            _orders_routing_module__WEBPACK_IMPORTED_MODULE_0__.OrdersPageRoutingModule
        ],
        declarations: [_orders_page__WEBPACK_IMPORTED_MODULE_1__.OrdersPage]
    })
], OrdersPageModule);



/***/ }),

/***/ 206:
/*!***************************************!*\
  !*** ./src/app/orders/orders.page.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "OrdersPage": () => (/* binding */ OrdersPage)
/* harmony export */ });
/* harmony import */ var _Users_govorkovalexander_Desktop_Zaec_bbox_bbox_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ 1670);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _orders_page_html_ngResource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./orders.page.html?ngResource */ 9646);
/* harmony import */ var _orders_page_scss_ngResource__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./orders.page.scss?ngResource */ 9043);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ionic/angular */ 3819);
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../services/user.service */ 3071);
/* harmony import */ var _components_right_menu_right_menu_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./../components/right-menu/right-menu.component */ 8486);








let OrdersPage = class OrdersPage {
  constructor(userService, popoverController) {
    this.userService = userService;
    this.popoverController = popoverController;
    this.is_load = false;
    this.is_reload = false;
    this.orders = [];
  }

  ngOnInit() {
    this.loadLeads();
  }

  loadLeads() {
    this.orders = [];
    this.userService.loadLeads().then(response => {
      console.log("this.userService.loadLeads:");
      console.log(response);
      response.deals.forEach(lead => {
        this.orders.push(lead);
      });
      this.is_load = true;
    });
  }

  openRightMenu(e) {
    var _this = this;

    return (0,_Users_govorkovalexander_Desktop_Zaec_bbox_bbox_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
      const popover = yield _this.popoverController.create({
        component: _components_right_menu_right_menu_component__WEBPACK_IMPORTED_MODULE_4__.RightMenuComponent,
        event: e
      });
      yield popover.present();
    })();
  }

  doRefresh(event) {
    console.log('Begin async operation');
    this.is_reload = true;
    this.userService.loadLeads().then(response => {
      console.log("this.userService.loadLeads:");
      console.log(response);
      this.orders = [];
      response.deals.forEach(lead => {
        this.orders.push(lead);
        event.target.complete();
      });
      this.is_reload = false;
    });
  }

};

OrdersPage.ctorParameters = () => [{
  type: _services_user_service__WEBPACK_IMPORTED_MODULE_3__.UserService
}, {
  type: _ionic_angular__WEBPACK_IMPORTED_MODULE_5__.PopoverController
}];

OrdersPage = (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__decorate)([(0,_angular_core__WEBPACK_IMPORTED_MODULE_7__.Component)({
  selector: 'app-orders',
  template: _orders_page_html_ngResource__WEBPACK_IMPORTED_MODULE_1__,
  styles: [_orders_page_scss_ngResource__WEBPACK_IMPORTED_MODULE_2__]
})], OrdersPage);


/***/ }),

/***/ 516:
/*!********************************************************************************************!*\
  !*** ./src/app/components/order-item-loading/order-item-loading.component.scss?ngResource ***!
  \********************************************************************************************/
/***/ ((module) => {

module.exports = "div.order-list-item {\n  width: 100%;\n  padding-bottom: 35px;\n}\ndiv.order-list-item div.order-date {\n  background: #FFFFFF;\n  border-radius: 10px;\n  height: 30px;\n  width: 200px;\n  margin: auto;\n  display: flex;\n}\ndiv.order-list-item div.order-date img {\n  width: 28px;\n  margin: 5px 15px;\n}\ndiv.order-list-item div.order-date span {\n  font-weight: 500;\n  font-size: 14px;\n  line-height: 17px;\n  display: flex;\n  align-items: center;\n  color: #373737;\n}\ndiv.order-list-item div.order-content {\n  padding-top: 15px;\n  padding-left: 20px;\n  display: flex;\n}\ndiv.order-list-item div.order-content div.order-image {\n  width: 120px;\n  height: 100px;\n  border-radius: 20px;\n  background-size: cover;\n}\ndiv.order-list-item div.order-content div.order-info {\n  width: calc(100% - 120px - 20px);\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n}\ndiv.order-list-item div.order-content div.order-info div.order-info-item {\n  margin-left: 5px;\n  background: #FFFFFF;\n  border-radius: 10px;\n  height: 30px;\n  width: 100%;\n  display: flex;\n  justify-content: flex-start;\n  flex-direction: row;\n  font-weight: 500;\n  font-size: 12px;\n  line-height: 17px;\n  color: #373737;\n}\ndiv.order-list-item div.order-content div.order-info div.order-info-item span.order-item-store {\n  display: inline-block;\n  width: 64px;\n  margin: 7px 10px;\n}\ndiv.order-list-item div.order-content div.order-info div.order-info-item div.order-item-delimiter {\n  position: relative;\n  width: 0px;\n  height: 19px;\n  left: -10px;\n  top: 5px;\n  border-left: 1px solid #373737;\n}\ndiv.order-list-item div.order-content div.order-info div.order-info-item span.order-item-value {\n  display: inline-block;\n  margin: 7px 0px;\n}\ndiv.order-list-item div.order-more {\n  padding-left: 20px;\n  padding-top: 10px;\n  width: calc(100% - 13px);\n}\ndiv.order-list-item div.order-more ion-button {\n  font-family: \"Montserrat\";\n  font-style: normal;\n  text-transform: none;\n  font-weight: 600;\n  font-size: 13px;\n  line-height: 29px;\n  height: 40px;\n  border-radius: 40px;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9yZGVyLWl0ZW0tbG9hZGluZy5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLFdBQUE7RUFDQSxvQkFBQTtBQUNKO0FBQUk7RUFDSSxtQkFBQTtFQUNBLG1CQUFBO0VBQ0EsWUFBQTtFQUNBLFlBQUE7RUFDQSxZQUFBO0VBQ0EsYUFBQTtBQUVSO0FBRFE7RUFDSSxXQUFBO0VBQ0EsZ0JBQUE7QUFHWjtBQURRO0VBQ0ksZ0JBQUE7RUFDQSxlQUFBO0VBQ0EsaUJBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxjQUFBO0FBR1o7QUFDSTtFQUNJLGlCQUFBO0VBQ0Esa0JBQUE7RUFDQSxhQUFBO0FBQ1I7QUFBUTtFQUNJLFlBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxzQkFBQTtBQUVaO0FBRVE7RUFFSSxnQ0FBQTtFQUNBLGFBQUE7RUFDQSxzQkFBQTtFQUNBLDhCQUFBO0FBRFo7QUFHWTtFQUNJLGdCQUFBO0VBQ0EsbUJBQUE7RUFDQSxtQkFBQTtFQUNBLFlBQUE7RUFDQSxXQUFBO0VBQ0EsYUFBQTtFQUNBLDJCQUFBO0VBQ0EsbUJBQUE7RUFDQSxnQkFBQTtFQUNBLGVBQUE7RUFDQSxpQkFBQTtFQUNBLGNBQUE7QUFEaEI7QUFFZ0I7RUFDSSxxQkFBQTtFQUNBLFdBQUE7RUFDQSxnQkFBQTtBQUFwQjtBQUVnQjtFQUNJLGtCQUFBO0VBQ0EsVUFBQTtFQUNBLFlBQUE7RUFDQSxXQUFBO0VBQ0EsUUFBQTtFQUNBLDhCQUFBO0FBQXBCO0FBRWdCO0VBQ0kscUJBQUE7RUFDQSxlQUFBO0FBQXBCO0FBTUk7RUFDSSxrQkFBQTtFQUNBLGlCQUFBO0VBQ0Esd0JBQUE7QUFKUjtBQUtRO0VBQ0kseUJBQUE7RUFDQSxrQkFBQTtFQUNBLG9CQUFBO0VBQ0EsZ0JBQUE7RUFDQSxlQUFBO0VBQ0EsaUJBQUE7RUFDQSxZQUFBO0VBQ0EsbUJBQUE7QUFIWiIsImZpbGUiOiJvcmRlci1pdGVtLWxvYWRpbmcuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyJkaXYub3JkZXItbGlzdC1pdGVtIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBwYWRkaW5nLWJvdHRvbTogMzVweDtcbiAgICBkaXYub3JkZXItZGF0ZSB7XG4gICAgICAgIGJhY2tncm91bmQ6ICNGRkZGRkY7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgICAgIGhlaWdodDogMzBweDtcbiAgICAgICAgd2lkdGg6IDIwMHB4O1xuICAgICAgICBtYXJnaW46IGF1dG87ICAgXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGltZyB7XG4gICAgICAgICAgICB3aWR0aDogMjhweDtcbiAgICAgICAgICAgIG1hcmdpbjogNXB4IDE1cHg7XG4gICAgICAgIH0gICAgIFxuICAgICAgICBzcGFuIHtcbiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICAgICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICAgICAgICBsaW5lLWhlaWdodDogMTdweDtcbiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICAgICAgY29sb3I6ICMzNzM3Mzc7ICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXYub3JkZXItY29udGVudCB7XG4gICAgICAgIHBhZGRpbmctdG9wOiAxNXB4O1xuICAgICAgICBwYWRkaW5nLWxlZnQ6IDIwcHg7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGRpdi5vcmRlci1pbWFnZSB7XG4gICAgICAgICAgICB3aWR0aDogMTIwcHg7XG4gICAgICAgICAgICBoZWlnaHQ6IDEwMHB4O1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMjBweDsgICAgICAgXG4gICAgICAgICAgICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyOyAgICBcblxuICAgICAgICB9XG5cbiAgICAgICAgZGl2Lm9yZGVyLWluZm8ge1xuXG4gICAgICAgICAgICB3aWR0aDogY2FsYygxMDAlIC0gMTIwcHggLSAyMHB4KTtcbiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyAgICAgICAgICAgIFxuXG4gICAgICAgICAgICBkaXYub3JkZXItaW5mby1pdGVtIHtcbiAgICAgICAgICAgICAgICBtYXJnaW4tbGVmdDogNXB4O1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICNGRkZGRkY7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMTBweDtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDMwcHg7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7ICBcbiAgICAgICAgICAgICAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgICAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxN3B4O1xuICAgICAgICAgICAgICAgIGNvbG9yOiAjMzczNzM3OyAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzcGFuLm9yZGVyLWl0ZW0tc3RvcmUge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiA2NHB4O1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW46IDdweCAxMHB4O1xuICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkaXYub3JkZXItaXRlbS1kZWxpbWl0ZXIge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAwcHg7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogMTlweDtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogLTEwcHg7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogNXB4O1xuICAgICAgICAgICAgICAgICAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICMzNzM3Mzc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNwYW4ub3JkZXItaXRlbS12YWx1ZSB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiA3cHggMHB4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpdi5vcmRlci1tb3JlIHtcbiAgICAgICAgcGFkZGluZy1sZWZ0OiAyMHB4O1xuICAgICAgICBwYWRkaW5nLXRvcDogMTBweDtcbiAgICAgICAgd2lkdGg6IGNhbGMoMTAwJSAtIDEzcHgpO1xuICAgICAgICBpb24tYnV0dG9uIHtcbiAgICAgICAgICAgIGZvbnQtZmFtaWx5OiAnTW9udHNlcnJhdCc7XG4gICAgICAgICAgICBmb250LXN0eWxlOiBub3JtYWw7ICAgICAgICAgICAgXG4gICAgICAgICAgICB0ZXh0LXRyYW5zZm9ybTogbm9uZTtcbiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICAgICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICAgICAgICBsaW5lLWhlaWdodDogMjlweDtcbiAgICAgICAgICAgIGhlaWdodDogNDBweDtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDQwcHg7XG4gICAgICAgIH1cbiAgICB9XG59Il19 */";

/***/ }),

/***/ 8610:
/*!****************************************************************************!*\
  !*** ./src/app/components/order-item/order-item.component.scss?ngResource ***!
  \****************************************************************************/
/***/ ((module) => {

module.exports = "div.order-list-item {\n  width: 100%;\n  padding-bottom: 35px;\n}\ndiv.order-list-item div.order-date {\n  background: #FFFFFF;\n  border: 1px solid #373737;\n  border-radius: 10px;\n  height: 30px;\n  width: 200px;\n  margin: auto;\n  display: flex;\n}\ndiv.order-list-item div.order-date img {\n  width: 28px;\n  margin: 5px 15px;\n}\ndiv.order-list-item div.order-date span {\n  font-weight: 500;\n  font-size: 14px;\n  line-height: 17px;\n  display: flex;\n  align-items: center;\n  color: #373737;\n}\ndiv.order-list-item div.order-content {\n  padding-top: 15px;\n  padding-left: 20px;\n  display: flex;\n}\ndiv.order-list-item div.order-content div.order-image {\n  width: 120px;\n  height: 100px;\n  border-radius: 20px;\n  background-size: cover;\n}\ndiv.order-list-item div.order-content div.order-info {\n  width: calc(100% - 120px - 20px);\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n}\ndiv.order-list-item div.order-content div.order-info div.order-info-item {\n  margin-left: 5px;\n  background: #FFFFFF;\n  border-radius: 10px;\n  height: 30px;\n  width: 100%;\n  display: flex;\n  justify-content: flex-start;\n  flex-direction: row;\n  font-weight: 500;\n  font-size: 12px;\n  line-height: 17px;\n  color: #373737;\n}\ndiv.order-list-item div.order-content div.order-info div.order-info-item span.order-item-store {\n  display: inline-block;\n  width: 64px;\n  margin: 7px 10px;\n}\ndiv.order-list-item div.order-content div.order-info div.order-info-item div.order-item-delimiter {\n  position: relative;\n  width: 0px;\n  height: 19px;\n  left: -10px;\n  top: 5px;\n  border-left: 1px solid #373737;\n}\ndiv.order-list-item div.order-content div.order-info div.order-info-item span.order-item-value {\n  display: inline-block;\n  margin: 7px 0px;\n}\ndiv.order-list-item div.order-more {\n  padding-left: 20px;\n  padding-top: 10px;\n  width: calc(100% - 13px);\n}\ndiv.order-list-item div.order-more ion-button {\n  font-family: \"Montserrat\";\n  font-style: normal;\n  text-transform: none;\n  font-weight: 600;\n  font-size: 13px;\n  line-height: 29px;\n  height: 40px;\n  border-radius: 40px;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9yZGVyLWl0ZW0uY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxXQUFBO0VBQ0Esb0JBQUE7QUFDSjtBQUFJO0VBQ0ksbUJBQUE7RUFDQSx5QkFBQTtFQUNBLG1CQUFBO0VBQ0EsWUFBQTtFQUNBLFlBQUE7RUFDQSxZQUFBO0VBQ0EsYUFBQTtBQUVSO0FBRFE7RUFDSSxXQUFBO0VBQ0EsZ0JBQUE7QUFHWjtBQURRO0VBQ0ksZ0JBQUE7RUFDQSxlQUFBO0VBQ0EsaUJBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxjQUFBO0FBR1o7QUFDSTtFQUNJLGlCQUFBO0VBQ0Esa0JBQUE7RUFDQSxhQUFBO0FBQ1I7QUFBUTtFQUNJLFlBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxzQkFBQTtBQUVaO0FBRVE7RUFFSSxnQ0FBQTtFQUNBLGFBQUE7RUFDQSxzQkFBQTtFQUNBLDhCQUFBO0FBRFo7QUFHWTtFQUNJLGdCQUFBO0VBQ0EsbUJBQUE7RUFDQSxtQkFBQTtFQUNBLFlBQUE7RUFDQSxXQUFBO0VBQ0EsYUFBQTtFQUNBLDJCQUFBO0VBQ0EsbUJBQUE7RUFDQSxnQkFBQTtFQUNBLGVBQUE7RUFDQSxpQkFBQTtFQUNBLGNBQUE7QUFEaEI7QUFFZ0I7RUFDSSxxQkFBQTtFQUNBLFdBQUE7RUFDQSxnQkFBQTtBQUFwQjtBQUVnQjtFQUNJLGtCQUFBO0VBQ0EsVUFBQTtFQUNBLFlBQUE7RUFDQSxXQUFBO0VBQ0EsUUFBQTtFQUNBLDhCQUFBO0FBQXBCO0FBRWdCO0VBQ0kscUJBQUE7RUFDQSxlQUFBO0FBQXBCO0FBTUk7RUFDSSxrQkFBQTtFQUNBLGlCQUFBO0VBQ0Esd0JBQUE7QUFKUjtBQUtRO0VBQ0kseUJBQUE7RUFDQSxrQkFBQTtFQUNBLG9CQUFBO0VBQ0EsZ0JBQUE7RUFDQSxlQUFBO0VBQ0EsaUJBQUE7RUFDQSxZQUFBO0VBQ0EsbUJBQUE7QUFIWiIsImZpbGUiOiJvcmRlci1pdGVtLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiZGl2Lm9yZGVyLWxpc3QtaXRlbSB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgcGFkZGluZy1ib3R0b206IDM1cHg7XG4gICAgZGl2Lm9yZGVyLWRhdGUge1xuICAgICAgICBiYWNrZ3JvdW5kOiAjRkZGRkZGO1xuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAjMzczNzM3O1xuICAgICAgICBib3JkZXItcmFkaXVzOiAxMHB4O1xuICAgICAgICBoZWlnaHQ6IDMwcHg7XG4gICAgICAgIHdpZHRoOiAyMDBweDtcbiAgICAgICAgbWFyZ2luOiBhdXRvOyAgIFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBpbWcge1xuICAgICAgICAgICAgd2lkdGg6IDI4cHg7XG4gICAgICAgICAgICBtYXJnaW46IDVweCAxNXB4O1xuICAgICAgICB9ICAgICBcbiAgICAgICAgc3BhbiB7XG4gICAgICAgICAgICBmb250LXdlaWdodDogNTAwO1xuICAgICAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDE3cHg7XG4gICAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgICAgIGNvbG9yOiAjMzczNzM3OyAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGl2Lm9yZGVyLWNvbnRlbnQge1xuICAgICAgICBwYWRkaW5nLXRvcDogMTVweDtcbiAgICAgICAgcGFkZGluZy1sZWZ0OiAyMHB4O1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBkaXYub3JkZXItaW1hZ2Uge1xuICAgICAgICAgICAgd2lkdGg6IDEyMHB4O1xuICAgICAgICAgICAgaGVpZ2h0OiAxMDBweDtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDIwcHg7ICAgICAgIFxuICAgICAgICAgICAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjsgICAgXG5cbiAgICAgICAgfVxuXG4gICAgICAgIGRpdi5vcmRlci1pbmZvIHtcblxuICAgICAgICAgICAgd2lkdGg6IGNhbGMoMTAwJSAtIDEyMHB4IC0gMjBweCk7XG4gICAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgICAgICAgICAgICBcblxuICAgICAgICAgICAgZGl2Lm9yZGVyLWluZm8taXRlbSB7XG4gICAgICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IDVweDtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAjRkZGRkZGO1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAzMHB4O1xuICAgICAgICAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgICAgICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0OyAgXG4gICAgICAgICAgICAgICAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgICAgICAgICAgICAgICBmb250LXdlaWdodDogNTAwO1xuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogMTdweDtcbiAgICAgICAgICAgICAgICBjb2xvcjogIzM3MzczNzsgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc3Bhbi5vcmRlci1pdGVtLXN0b3JlIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogNjRweDtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiA3cHggMTBweDtcbiAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGl2Lm9yZGVyLWl0ZW0tZGVsaW1pdGVyIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMHB4O1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDE5cHg7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IC0xMHB4O1xuICAgICAgICAgICAgICAgICAgICB0b3A6IDVweDtcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjMzczNzM3O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzcGFuLm9yZGVyLWl0ZW0tdmFsdWUge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbjogN3B4IDBweDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXYub3JkZXItbW9yZSB7XG4gICAgICAgIHBhZGRpbmctbGVmdDogMjBweDtcbiAgICAgICAgcGFkZGluZy10b3A6IDEwcHg7XG4gICAgICAgIHdpZHRoOiBjYWxjKDEwMCUgLSAxM3B4KTtcbiAgICAgICAgaW9uLWJ1dHRvbiB7XG4gICAgICAgICAgICBmb250LWZhbWlseTogJ01vbnRzZXJyYXQnO1xuICAgICAgICAgICAgZm9udC1zdHlsZTogbm9ybWFsOyAgICAgICAgICAgIFxuICAgICAgICAgICAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG4gICAgICAgICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgICAgICAgZm9udC1zaXplOiAxM3B4O1xuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDI5cHg7XG4gICAgICAgICAgICBoZWlnaHQ6IDQwcHg7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiA0MHB4O1xuICAgICAgICB9XG4gICAgfVxufSJdfQ== */";

/***/ }),

/***/ 4882:
/*!****************************************************************************!*\
  !*** ./src/app/components/right-menu/right-menu.component.scss?ngResource ***!
  \****************************************************************************/
/***/ ((module) => {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJyaWdodC1tZW51LmNvbXBvbmVudC5zY3NzIn0= */";

/***/ }),

/***/ 9043:
/*!****************************************************!*\
  !*** ./src/app/orders/orders.page.scss?ngResource ***!
  \****************************************************/
/***/ ((module) => {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJvcmRlcnMucGFnZS5zY3NzIn0= */";

/***/ }),

/***/ 794:
/*!********************************************************************************************!*\
  !*** ./src/app/components/order-item-loading/order-item-loading.component.html?ngResource ***!
  \********************************************************************************************/
/***/ ((module) => {

module.exports = "<div class=\"order-list-item\">\n  <div class=\"order-date\">\n    <ion-skeleton-text animated style=\"width: 100%; height: 30px; margin: 0px;\"></ion-skeleton-text>\n  </div>\n  <div class=\"order-content\">\n    <div class=\"order-image\">\n      <ion-skeleton-text animated style=\"width: 100%; height: 100px; margin: 0px;\"></ion-skeleton-text>\n    </div>\n    <div class=\"order-info\">\n      \n      <div class=\"order-info-item\">\n        <ion-skeleton-text animated style=\"width: 100%; height:30px; margin-top: 0px;\"></ion-skeleton-text>\n      </div>\n      \n      <div class=\"order-info-item\">\n        <ion-skeleton-text animated style=\"width: 100%; height:30px; margin-top: 0px;\"></ion-skeleton-text>\n      </div>\n      \n      <div class=\"order-info-item\">\n        <ion-skeleton-text animated style=\"width: 100%; height:30px; margin-top: 0px;\"></ion-skeleton-text>\n      </div>\n\n    </div>\n  </div>\n  <div class=\"order-more\">\n    <ion-skeleton-text animated style=\"width: 100%; height:30px; margin-top: 0px; border-radius: 40px;height: 40px;\"></ion-skeleton-text>\n  </div>\n</div>\n\n";

/***/ }),

/***/ 7057:
/*!****************************************************************************!*\
  !*** ./src/app/components/order-item/order-item.component.html?ngResource ***!
  \****************************************************************************/
/***/ ((module) => {

module.exports = "<div class=\"order-list-item\">\n  <div class=\"order-date\">\n    <img class=\"icon\" src=\"../../../assets/schedule.png\">\n    <span>{{_order.DATE}}</span>\n  </div>\n  <div class=\"order-content\">\n    <div class=\"order-image\" style=\"background-image: url('{{_order.IMAGE}}');\"> </div>\n    <div class=\"order-info\">\n      \n      <div class=\"order-info-item\">\n        <span class=\"order-item-store\">Магазин</span>\n        <div class=\"order-item-delimiter\"></div>\n        <span class=\"order-item-value\">{{_order.STORE}}</span>\n      </div>\n      \n      <div class=\"order-info-item\">\n        <span class=\"order-item-store\">Сумма</span>\n        <div class=\"order-item-delimiter\"></div>\n        <span class=\"order-item-value\">{{_order.SUM}}</span>\n      </div>\n      \n      <div class=\"order-info-item\">\n        <span class=\"order-item-store\">Статус</span>\n        <div class=\"order-item-delimiter\"></div>\n        <span class=\"order-item-value\">{{_order.STAGE}}</span>\n      </div>\n\n    </div>\n  </div>\n  <div class=\"order-more\">\n    <ion-button color=\"button-color\" expand=\"block\" (click)=\"openItem()\" shape=\"round\">Подробнее</ion-button>\n  </div>\n</div>\n\n";

/***/ }),

/***/ 3763:
/*!****************************************************************************!*\
  !*** ./src/app/components/right-menu/right-menu.component.html?ngResource ***!
  \****************************************************************************/
/***/ ((module) => {

module.exports = "<ion-content>\n  <ion-list lines=\"none\">\n    <ion-item button=\"true\" detail=\"false\" (click)=\"logout()\">Выход</ion-item>\n  </ion-list>\n</ion-content>";

/***/ }),

/***/ 9646:
/*!****************************************************!*\
  !*** ./src/app/orders/orders.page.html?ngResource ***!
  \****************************************************/
/***/ ((module) => {

module.exports = "<ion-header class=\"ion-no-border\">\n  <ion-toolbar>\n    <ion-buttons slot=\"start\">\n      <img src=\"../../assets/logo.png\">\n    </ion-buttons>\n    <ion-title class=\"ion-text-center\">МОИ ЗАКАЗЫ</ion-title>\n    <ion-buttons slot=\"end\">\n      <ion-button color=\"button-color\" (click)=\"openRightMenu($event)\">\n        <ion-icon slot=\"icon-only\" name=\"ellipsis-vertical-outline\"></ion-icon>\n      </ion-button>\n    </ion-buttons>\n  </ion-toolbar>\n</ion-header>\n\n<ion-content>\n  \n  <ion-refresher slot=\"fixed\" (ionRefresh)=\"doRefresh($event)\">\n    <ion-refresher-content\n      pullingIcon=\"chevron-down-circle-outline\"\n      pullingText=\"Потяните для обновления\"\n      refreshingSpinner=\"circles\"\n      refreshingText=\"Загрузка...\">\n    </ion-refresher-content>\n  </ion-refresher>\n\n  <ion-popover trigger=\"popover-button\" dismiss-on-select=\"true\">\n    <ion-content>\n      <ion-list>\n        <ion-item button=\"true\" detail=\"false\">Выход</ion-item>\n      </ion-list>\n    </ion-content>\n  </ion-popover>\n\n\n  <div class=\"orders-list ion-padding-top\" *ngIf=\"!is_load && !is_reload\">\n    <app-order-item-loading *ngFor=\"let i of [0,1,2]\"></app-order-item-loading>\n  </div>\n  \n  <div class=\"orders-list ion-padding-top\"  *ngIf=\"is_load && !is_reload && orders.length>0\">\n    <app-order-item [order]=\"order\" *ngFor=\"let order of orders\"></app-order-item>\n  </div>\n  \n  <div class=\"orders-list ion-text-center ion-padding-top\"  *ngIf=\"is_load && !is_reload && orders.length==0\">\n    Список заказов пуст.\n  </div>\n</ion-content>\n";

/***/ })

}]);
//# sourceMappingURL=src_app_orders_orders_module_ts.js.map
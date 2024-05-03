"use strict";
(self["webpackChunkapp"] = self["webpackChunkapp"] || []).push([["default-src_app_order_order_page_ts"],{

/***/ 6107:
/*!*************************************!*\
  !*** ./src/app/order/order.page.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "OrderPage": () => (/* binding */ OrderPage)
/* harmony export */ });
/* harmony import */ var _Users_govorkovalexander_Desktop_Zaec_bbox_bbox_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ 1670);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _order_page_html_ngResource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./order.page.html?ngResource */ 613);
/* harmony import */ var _order_page_scss_ngResource__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./order.page.scss?ngResource */ 9279);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ionic/angular */ 3819);
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../services/user.service */ 3071);
/* harmony import */ var _image_zoom_image_zoom_page__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./../image-zoom/image-zoom.page */ 1343);








let OrderPage = class OrderPage {
  constructor(userService, modalCtrl) {
    this.userService = userService;
    this.modalCtrl = modalCtrl;
    this.is_load = false;
    this.options = {
      keyboard: true,
      spaceBetween: 3
    };
    this.images = ['../../assets/item_big.png', '../../assets/item_big.png', '../../assets/item_big.png', '../../assets/item_big.png'];
  }

  ngOnInit() {
    console.log(this.order_id);
    this.userService.loadLead(this.order_id).then(response => {
      this.order_info = response;
      console.log(this.order_info);
      this.is_load = true;
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  slideWillChange() {
    console.log('Slide will change');
  }

  slideDidChange() {
    var _this = this;

    return (0,_Users_govorkovalexander_Desktop_Zaec_bbox_bbox_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
      console.log('Slide did change');
      if (!_this.slidesRef) return;
      console.table({
        isBeginning: yield _this.slidesRef.isBeginning(),
        isEnd: yield _this.slidesRef.isEnd()
      });
    })();
  }

  slidePrev() {
    this.slidesRef.slidePrev();
  }

  slideNext() {
    this.slidesRef.slideNext();
  }

  openPreview() {
    var _this2 = this;

    return (0,_Users_govorkovalexander_Desktop_Zaec_bbox_bbox_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
      const modal = yield _this2.modalCtrl.create({
        component: _image_zoom_image_zoom_page__WEBPACK_IMPORTED_MODULE_4__.ImageZoomPage,
        componentProps: {
          img: _this2.order_info.deal_detail.IMAGE
        },
        cssClass: 'transparent-modal'
      });
      modal.present();
    })();
  }

};

OrderPage.ctorParameters = () => [{
  type: _services_user_service__WEBPACK_IMPORTED_MODULE_3__.UserService
}, {
  type: _ionic_angular__WEBPACK_IMPORTED_MODULE_5__.ModalController
}];

OrderPage.propDecorators = {
  slidesRef: [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_6__.ViewChild,
    args: ['slidesRef', {
      static: true
    }]
  }]
};
OrderPage = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__decorate)([(0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.Component)({
  selector: 'app-order',
  template: _order_page_html_ngResource__WEBPACK_IMPORTED_MODULE_1__,
  styles: [_order_page_scss_ngResource__WEBPACK_IMPORTED_MODULE_2__]
})], OrderPage);


/***/ }),

/***/ 9279:
/*!**************************************************!*\
  !*** ./src/app/order/order.page.scss?ngResource ***!
  \**************************************************/
/***/ ((module) => {

module.exports = "ion-header ion-button {\n  height: 34px;\n  width: 34px;\n  --padding-bottom: 0px;\n  --padding-top: 0px;\n  --padding-start: 0px;\n  --padding-end: 0px;\n}\nion-header ion-button img {\n  width: 28px;\n  height: 28px;\n  padding: 0px;\n}\ndiv.order-info {\n  padding-top: 25px;\n  margin-left: 15px;\n  margin-right: 15px;\n}\ndiv.order-info div.order-info-item {\n  background-color: #fff;\n  font-weight: 500;\n  font-size: 12px;\n  line-height: 17px;\n  color: #373737;\n  height: 33px;\n  margin-bottom: 2px;\n  display: flex;\n  padding: 8px 15px;\n}\ndiv.order-info div.order-info-item span.order-item-store {\n  display: inline-block;\n  width: 74px;\n}\ndiv.order-info div.order-info-item div.order-item-delimiter {\n  position: relative;\n  width: 0px;\n  height: 19px;\n  border-left: 1px solid #373737;\n}\ndiv.order-info div.order-info-item span.order-item-value {\n  display: inline-block;\n  margin-left: 10px;\n}\ndiv.order-info div.order-info-item:first-child {\n  border-top-left-radius: 10px;\n  border-top-right-radius: 10px;\n}\ndiv.order-info div.order-info-item:last-child {\n  border-bottom-left-radius: 10px;\n  border-bottom-right-radius: 10px;\n}\ndiv.order-images {\n  min-height: 200px;\n  margin-left: 15px;\n  margin-right: 15px;\n  padding-top: 25px;\n  padding-bottom: 35px;\n  display: flex;\n  align-items: center;\n}\ndiv.order-images div.arrow {\n  height: 30px;\n}\ndiv.order-images div.arrow ion-button {\n  height: 34px;\n  width: 34px;\n  --padding-bottom: 0px;\n  --padding-top: 0px;\n  --padding-start: 0px;\n  --padding-end: 0px;\n}\ndiv.order-images div.arrow ion-button img {\n  width: 32px;\n  height: 32px;\n  padding: 0px;\n}\ndiv.order-images div.arrow.left-arrow img {\n  transform: rotate(-90deg);\n}\ndiv.order-images div.arrow.right-arrow img {\n  transform: rotate(90deg);\n}\ndiv.order-images div.slide {\n  height: 100%;\n  width: calc(100% - 38px - 38px);\n}\ndiv.order-images div.slide div.image {\n  min-height: 200px;\n  height: 100%;\n  width: 100%;\n  border-radius: 10px;\n  background-size: cover;\n}\ndiv.order-images.no-slider div.slide {\n  width: 100%;\n}\ndiv.order-statuses-info {\n  padding-top: 15px;\n  margin-left: 15px;\n  margin-right: 15px;\n}\ndiv.order-statuses-info div.order-info-item {\n  background-color: #fff;\n  font-weight: 500;\n  font-size: 12px;\n  line-height: 17px;\n  color: #373737;\n  height: 33px;\n  margin-bottom: 2px;\n  display: flex;\n  padding: 8px 15px;\n}\ndiv.order-statuses-info div.order-info-item span.order-item-store {\n  display: inline-block;\n  width: 74px;\n}\ndiv.order-statuses-info div.order-info-item div.order-item-delimiter {\n  position: relative;\n  width: 0px;\n  height: 19px;\n  border-left: 1px solid #373737;\n}\ndiv.order-statuses-info div.order-info-item span.order-item-value {\n  display: inline-block;\n  margin-left: 10px;\n}\ndiv.order-statuses-info div.order-info-item:first-child {\n  border-top-left-radius: 10px;\n  border-top-right-radius: 10px;\n}\ndiv.order-statuses-info div.order-info-item:last-child {\n  border-bottom-left-radius: 10px;\n  border-bottom-right-radius: 10px;\n}\ndiv.order-date {\n  margin-top: 25px;\n  background: #FFFFFF;\n  border: 1px solid #373737;\n  border-radius: 10px;\n  height: 30px;\n  width: 200px;\n  margin: auto;\n  display: flex;\n}\ndiv.order-date img {\n  width: 18px;\n  margin: 5px 15px;\n}\ndiv.order-date span {\n  font-weight: 500;\n  font-size: 14px;\n  line-height: 17px;\n  display: flex;\n  align-items: center;\n  color: #373737;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9yZGVyLnBhZ2Uuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDSTtFQUNJLFlBQUE7RUFDQSxXQUFBO0VBQ0EscUJBQUE7RUFDQSxrQkFBQTtFQUNBLG9CQUFBO0VBQ0Esa0JBQUE7QUFBUjtBQUNRO0VBQ0ksV0FBQTtFQUNBLFlBQUE7RUFDQSxZQUFBO0FBQ1o7QUFJQTtFQUNJLGlCQUFBO0VBQ0EsaUJBQUE7RUFDQSxrQkFBQTtBQURKO0FBR0k7RUFDSSxzQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0VBQ0EsY0FBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLGFBQUE7RUFDQSxpQkFBQTtBQURSO0FBR1E7RUFDSSxxQkFBQTtFQUNBLFdBQUE7QUFEWjtBQUdRO0VBQ0ksa0JBQUE7RUFDQSxVQUFBO0VBQ0EsWUFBQTtFQUNBLDhCQUFBO0FBRFo7QUFHUTtFQUNJLHFCQUFBO0VBQ0EsaUJBQUE7QUFEWjtBQU1JO0VBQ0ksNEJBQUE7RUFDQSw2QkFBQTtBQUpSO0FBT0k7RUFDSSwrQkFBQTtFQUNBLGdDQUFBO0FBTFI7QUFXQTtFQUNJLGlCQUFBO0VBQ0EsaUJBQUE7RUFDQSxrQkFBQTtFQUNBLGlCQUFBO0VBQ0Esb0JBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7QUFSSjtBQVVJO0VBQ0ksWUFBQTtBQVJSO0FBU1E7RUFDSSxZQUFBO0VBQ0EsV0FBQTtFQUNBLHFCQUFBO0VBQ0Esa0JBQUE7RUFDQSxvQkFBQTtFQUNBLGtCQUFBO0FBUFo7QUFRWTtFQUNJLFdBQUE7RUFDQSxZQUFBO0VBQ0EsWUFBQTtBQU5oQjtBQVdJO0VBQTBCLHlCQUFBO0FBUjlCO0FBU0k7RUFBMkIsd0JBQUE7QUFOL0I7QUFRSTtFQUNJLFlBQUE7RUFDQSwrQkFBQTtBQU5SO0FBT1E7RUFDSSxpQkFBQTtFQUNBLFlBQUE7RUFDQSxXQUFBO0VBQ0EsbUJBQUE7RUFDQSxzQkFBQTtBQUxaO0FBV0k7RUFDSSxXQUFBO0FBUlI7QUFhQTtFQUNJLGlCQUFBO0VBQ0EsaUJBQUE7RUFDQSxrQkFBQTtBQVZKO0FBWUk7RUFDSSxzQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0VBQ0EsY0FBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLGFBQUE7RUFDQSxpQkFBQTtBQVZSO0FBWVE7RUFDSSxxQkFBQTtFQUNBLFdBQUE7QUFWWjtBQVlRO0VBQ0ksa0JBQUE7RUFDQSxVQUFBO0VBQ0EsWUFBQTtFQUNBLDhCQUFBO0FBVlo7QUFZUTtFQUNJLHFCQUFBO0VBQ0EsaUJBQUE7QUFWWjtBQWVJO0VBQ0ksNEJBQUE7RUFDQSw2QkFBQTtBQWJSO0FBZ0JJO0VBQ0ksK0JBQUE7RUFDQSxnQ0FBQTtBQWRSO0FBa0JBO0VBQ0ksZ0JBQUE7RUFDQSxtQkFBQTtFQUNBLHlCQUFBO0VBQ0EsbUJBQUE7RUFDQSxZQUFBO0VBQ0EsWUFBQTtFQUNBLFlBQUE7RUFDQSxhQUFBO0FBZko7QUFnQkk7RUFDSSxXQUFBO0VBQ0EsZ0JBQUE7QUFkUjtBQWdCSTtFQUNJLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0VBQ0EsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsY0FBQTtBQWRSIiwiZmlsZSI6Im9yZGVyLnBhZ2Uuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbImlvbi1oZWFkZXIge1xuICAgIGlvbi1idXR0b24ge1xuICAgICAgICBoZWlnaHQ6IDM0cHg7XG4gICAgICAgIHdpZHRoOiAzNHB4O1xuICAgICAgICAtLXBhZGRpbmctYm90dG9tOiAwcHg7XG4gICAgICAgIC0tcGFkZGluZy10b3A6IDBweDtcbiAgICAgICAgLS1wYWRkaW5nLXN0YXJ0OiAwcHg7XG4gICAgICAgIC0tcGFkZGluZy1lbmQ6IDBweDsgICAgICAgIFxuICAgICAgICBpbWcge1xuICAgICAgICAgICAgd2lkdGg6IDI4cHg7XG4gICAgICAgICAgICBoZWlnaHQ6IDI4cHg7XG4gICAgICAgICAgICBwYWRkaW5nOiAwcHg7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmRpdi5vcmRlci1pbmZvIHtcbiAgICBwYWRkaW5nLXRvcDogMjVweDtcbiAgICBtYXJnaW4tbGVmdDogMTVweDtcbiAgICBtYXJnaW4tcmlnaHQ6IDE1cHg7XG4gICAgXG4gICAgZGl2Lm9yZGVyLWluZm8taXRlbSB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgICAgbGluZS1oZWlnaHQ6IDE3cHg7XG4gICAgICAgIGNvbG9yOiAjMzczNzM3O1xuICAgICAgICBoZWlnaHQ6IDMzcHg7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDJweDtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgcGFkZGluZzogOHB4IDE1cHg7XG5cbiAgICAgICAgc3Bhbi5vcmRlci1pdGVtLXN0b3JlIHtcbiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgICAgICAgIHdpZHRoOiA3NHB4O1xuICAgICAgICB9ICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGRpdi5vcmRlci1pdGVtLWRlbGltaXRlciB7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICB3aWR0aDogMHB4O1xuICAgICAgICAgICAgaGVpZ2h0OiAxOXB4O1xuICAgICAgICAgICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjMzczNzM3O1xuICAgICAgICB9XG4gICAgICAgIHNwYW4ub3JkZXItaXRlbS12YWx1ZSB7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogMTBweDtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgZGl2Lm9yZGVyLWluZm8taXRlbTpmaXJzdC1jaGlsZCB7XG4gICAgICAgIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IDEwcHg7XG4gICAgICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiAxMHB4O1xuICAgIH1cblxuICAgIGRpdi5vcmRlci1pbmZvLWl0ZW06bGFzdC1jaGlsZCB7XG4gICAgICAgIGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6IDEwcHg7XG4gICAgICAgIGJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOiAxMHB4O1xuICAgIH1cbn1cblxuXG5cbmRpdi5vcmRlci1pbWFnZXMge1xuICAgIG1pbi1oZWlnaHQ6IDIwMHB4O1xuICAgIG1hcmdpbi1sZWZ0OiAxNXB4O1xuICAgIG1hcmdpbi1yaWdodDogMTVweDsgICAgXG4gICAgcGFkZGluZy10b3A6IDI1cHg7XG4gICAgcGFkZGluZy1ib3R0b206IDM1cHg7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuXG4gICAgZGl2LmFycm93IHtcbiAgICAgICAgaGVpZ2h0OiAzMHB4O1xuICAgICAgICBpb24tYnV0dG9uIHtcbiAgICAgICAgICAgIGhlaWdodDogMzRweDtcbiAgICAgICAgICAgIHdpZHRoOiAzNHB4O1xuICAgICAgICAgICAgLS1wYWRkaW5nLWJvdHRvbTogMHB4O1xuICAgICAgICAgICAgLS1wYWRkaW5nLXRvcDogMHB4O1xuICAgICAgICAgICAgLS1wYWRkaW5nLXN0YXJ0OiAwcHg7XG4gICAgICAgICAgICAtLXBhZGRpbmctZW5kOiAwcHg7ICAgICAgICBcbiAgICAgICAgICAgIGltZyB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDMycHg7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAzMnB4O1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6IDBweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpdi5hcnJvdy5sZWZ0LWFycm93IGltZyB7dHJhbnNmb3JtOiByb3RhdGUoLTkwZGVnKTs7fVxuICAgIGRpdi5hcnJvdy5yaWdodC1hcnJvdyBpbWcge3RyYW5zZm9ybTogcm90YXRlKDkwZGVnKTs7fVxuXG4gICAgZGl2LnNsaWRlIHtcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICB3aWR0aDogY2FsYygxMDAlIC0gMzhweCAtIDM4cHgpO1xuICAgICAgICBkaXYuaW1hZ2Uge1xuICAgICAgICAgICAgbWluLWhlaWdodDogMjAwcHg7XG4gICAgICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5kaXYub3JkZXItaW1hZ2VzLm5vLXNsaWRlciB7XG4gICAgZGl2LnNsaWRlIHtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgfVxufVxuXG5cbmRpdi5vcmRlci1zdGF0dXNlcy1pbmZvIHtcbiAgICBwYWRkaW5nLXRvcDogMTVweDtcbiAgICBtYXJnaW4tbGVmdDogMTVweDtcbiAgICBtYXJnaW4tcmlnaHQ6IDE1cHg7XG4gICAgXG4gICAgZGl2Lm9yZGVyLWluZm8taXRlbSB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgICAgbGluZS1oZWlnaHQ6IDE3cHg7XG4gICAgICAgIGNvbG9yOiAjMzczNzM3O1xuICAgICAgICBoZWlnaHQ6IDMzcHg7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDJweDtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgcGFkZGluZzogOHB4IDE1cHg7XG5cbiAgICAgICAgc3Bhbi5vcmRlci1pdGVtLXN0b3JlIHtcbiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgICAgICAgIHdpZHRoOiA3NHB4O1xuICAgICAgICB9ICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGRpdi5vcmRlci1pdGVtLWRlbGltaXRlciB7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICB3aWR0aDogMHB4O1xuICAgICAgICAgICAgaGVpZ2h0OiAxOXB4O1xuICAgICAgICAgICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjMzczNzM3O1xuICAgICAgICB9XG4gICAgICAgIHNwYW4ub3JkZXItaXRlbS12YWx1ZSB7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogMTBweDtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgZGl2Lm9yZGVyLWluZm8taXRlbTpmaXJzdC1jaGlsZCB7XG4gICAgICAgIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IDEwcHg7XG4gICAgICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiAxMHB4O1xuICAgIH1cblxuICAgIGRpdi5vcmRlci1pbmZvLWl0ZW06bGFzdC1jaGlsZCB7XG4gICAgICAgIGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6IDEwcHg7XG4gICAgICAgIGJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOiAxMHB4O1xuICAgIH1cbn1cblxuZGl2Lm9yZGVyLWRhdGUge1xuICAgIG1hcmdpbi10b3A6IDI1cHg7XG4gICAgYmFja2dyb3VuZDogI0ZGRkZGRjtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjMzczNzM3O1xuICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgaGVpZ2h0OiAzMHB4O1xuICAgIHdpZHRoOiAyMDBweDtcbiAgICBtYXJnaW46IGF1dG87ICAgXG4gICAgZGlzcGxheTogZmxleDtcbiAgICBpbWcge1xuICAgICAgICB3aWR0aDogMThweDtcbiAgICAgICAgbWFyZ2luOiA1cHggMTVweDtcbiAgICB9ICAgICBcbiAgICBzcGFuIHtcbiAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICBsaW5lLWhlaWdodDogMTdweDtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgY29sb3I6ICMzNzM3Mzc7ICAgICAgICAgICAgXG4gICAgfVxufSJdfQ== */";

/***/ }),

/***/ 613:
/*!**************************************************!*\
  !*** ./src/app/order/order.page.html?ngResource ***!
  \**************************************************/
/***/ ((module) => {

module.exports = "<ion-header class=\"ion-no-border\">\n  <ion-toolbar>\n    <ion-buttons slot=\"start\">\n      <img src=\"../../assets/logo.png\">\n    </ion-buttons>\n    \n    <ion-buttons slot=\"end\">\n      <ion-button fill=\"solid\" color=\"button-color\" shape=\"round\" href=\"https://t.me/agcentory240\">\n        <img src=\"../../assets/telegram-white.png\">\n      </ion-button>\n      <ion-button fill=\"solid\" color=\"button-color\" shape=\"round\"  href=\"https://wa.me/79060510120\">\n        <img src=\"../../assets/viber-white.png\">\n      </ion-button>\n      <ion-button color=\"button-color\" (click)=\"close()\">\n        <ion-icon slot=\"icon-only\" name=\"close-outline\"></ion-icon>\n      </ion-button>\n    </ion-buttons>\n  </ion-toolbar>\n</ion-header>\n\n<ion-content>\n\n\n  <div *ngIf=\"!is_load\">\n    <div class=\"order-info\">\n      <div class=\"order-info-item\" style=\"padding:0px;\"><ion-skeleton-text animated style=\"width: 100%; height:33px; margin-top: 0px;border-top-left-radius: 10px; border-top-right-radius: 10px;\"></ion-skeleton-text></div>\n      <div class=\"order-info-item\" style=\"padding:0px;\"><ion-skeleton-text animated style=\"width: 100%; height:33px; margin-top: 0px;\"></ion-skeleton-text></div>\n      <div class=\"order-info-item\" style=\"padding:0px;\"><ion-skeleton-text animated style=\"width: 100%; height:33px; margin-top: 0px;border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;\"></ion-skeleton-text></div>\n    </div>\n\n    <div class=\"order-images\">\n      <ion-skeleton-text animated style=\"width: 100%; height: 200px; margin: 0px; border-radius: 10px;;\"></ion-skeleton-text>\n    </div>\n    <div class=\"order-date\" style=\"border:0px;\"><ion-skeleton-text animated style=\"width: 100%; height: 30px; margin: 0px; border-radius: 10px;;\"></ion-skeleton-text>\n    </div>\n\n    <div class=\"order-statuses-info\">\n      <div class=\"order-info-item\" style=\"padding:0px;\"><ion-skeleton-text animated style=\"width: 100%; height:33px; margin-top: 0px; border-top-left-radius: 10px; border-top-right-radius: 10px;\"></ion-skeleton-text></div>\n      \n      <div class=\"order-info-item\" style=\"padding:0px;\"><ion-skeleton-text animated style=\"width: 100%; height:33px; margin-top: 0px;\"></ion-skeleton-text></div>\n      \n      <div class=\"order-info-item\" style=\"padding:0px; \"><ion-skeleton-text animated style=\"width: 100%; height:33px; margin-top: 0px; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;\"></ion-skeleton-text></div>\n    </div>    \n  </div>\n\n  <div *ngIf=\"is_load\">\n    <div class=\"order-info\">\n      <div class=\"order-info-item\">\n        <span class=\"order-item-store\">Магазин</span>\n        <div class=\"order-item-delimiter\"></div>\n        <span class=\"order-item-value\">{{order_info.deal.STORE}}</span>\n      </div>\n      \n      <div class=\"order-info-item\">\n        <span class=\"order-item-store\">Сумма</span>\n        <div class=\"order-item-delimiter\"></div>\n        <span class=\"order-item-value\">{{order_info.deal.SUM}}</span>\n      </div>\n      \n      <div class=\"order-info-item\">\n        <span class=\"order-item-store\">Статус</span>\n        <div class=\"order-item-delimiter\"></div>\n        <span class=\"order-item-value\">{{order_info.deal.STAGE}}</span>\n      </div>\n    </div>\n\n    <!--\n    <div class=\"order-images\">\n      <div class=\"arrow left-arrow\">\n        <ion-button (click)=\"slidePrev()\" expand=\"block\" fill=\"clear\" shape=\"round\">\n          <img src=\"../../assets/arrow.png\">\n        </ion-button>\n      </div>\n      <div class=\"slide\">\n        <ion-slides [pager]=\"false\" [scrollbar]=\"false\" [options]=\"options\" (ionSlideWillChange)=\"slideWillChange()\" (ionSlideDidChange)=\"slideDidChange()\" #slidesRef>\n          <ion-slide *ngFor=\"let image of images\">\n            <div class=\"image\" style=\"background-image: url('{{image}}');\">\n\n            </div>\n          </ion-slide>\n        </ion-slides>\n      </div>\n      <div class=\"arrow right-arrow\">\n        <ion-button (click)=\"slideNext()\" expand=\"block\" fill=\"clear\" shape=\"round\">\n          <img src=\"../../assets/arrow.png\">\n        </ion-button>      \n      </div>\n    </div>\n  -->\n    <div class=\"order-images no-slider\" *ngIf=\"order_info.deal_detail.IMAGE\">\n      <div class=\"slide\">\n        <div class=\"image\" style=\"background-image: url('{{order_info.deal_detail.IMAGE}}');\" (click)=\"openPreview()\"> \n\n        </div>        \n      </div>\n    </div>\n\n    <div class=\"order-date\">\n      <img class=\"icon\" src=\"../../../assets/delivery.png\">\n      <span>История статусов</span>\n    </div>\n\n    <div class=\"order-statuses-info\">\n\n      <div class=\"order-info-item\" *ngFor=\"let status of order_info.history\">\n        <span class=\"order-item-store\">{{status.DATE}}</span>\n        <div class=\"order-item-delimiter\"></div>\n        <span class=\"order-item-value\">{{status.OPERATION}}</span>\n      </div>\n    </div>\n  </div>\n\n</ion-content>\n";

/***/ })

}]);
//# sourceMappingURL=default-src_app_order_order_page_ts.js.map
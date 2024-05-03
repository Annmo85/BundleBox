"use strict";
(self["webpackChunkapp"] = self["webpackChunkapp"] || []).push([["src_app_login_login_module_ts"],{

/***/ 5393:
/*!***********************************************!*\
  !*** ./src/app/login/login-routing.module.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LoginPageRoutingModule": () => (/* binding */ LoginPageRoutingModule)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _login_page__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./login.page */ 6825);




const routes = [
    {
        path: '',
        component: _login_page__WEBPACK_IMPORTED_MODULE_0__.LoginPage
    }
];
let LoginPageRoutingModule = class LoginPageRoutingModule {
};
LoginPageRoutingModule = (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.NgModule)({
        imports: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule.forChild(routes)],
        exports: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule],
    })
], LoginPageRoutingModule);



/***/ }),

/***/ 107:
/*!***************************************!*\
  !*** ./src/app/login/login.module.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LoginPageModule": () => (/* binding */ LoginPageModule)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/forms */ 2508);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ionic/angular */ 3819);
/* harmony import */ var _login_routing_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./login-routing.module */ 5393);
/* harmony import */ var _login_page__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./login.page */ 6825);
/* harmony import */ var ngx_mask__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ngx-mask */ 446);









let LoginPageModule = class LoginPageModule {
};
LoginPageModule = (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.NgModule)({
        imports: [
            _angular_common__WEBPACK_IMPORTED_MODULE_4__.CommonModule,
            _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormsModule,
            _ionic_angular__WEBPACK_IMPORTED_MODULE_6__.IonicModule,
            _angular_forms__WEBPACK_IMPORTED_MODULE_5__.ReactiveFormsModule,
            ngx_mask__WEBPACK_IMPORTED_MODULE_7__.NgxMaskModule.forChild(),
            _login_routing_module__WEBPACK_IMPORTED_MODULE_0__.LoginPageRoutingModule
        ],
        declarations: [_login_page__WEBPACK_IMPORTED_MODULE_1__.LoginPage],
        providers: [ngx_mask__WEBPACK_IMPORTED_MODULE_7__.MaskPipe]
    })
], LoginPageModule);



/***/ }),

/***/ 6825:
/*!*************************************!*\
  !*** ./src/app/login/login.page.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LoginPage": () => (/* binding */ LoginPage)
/* harmony export */ });
/* harmony import */ var _Users_govorkovalexander_Desktop_Zaec_bbox_bbox_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ 1670);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _login_page_html_ngResource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./login.page.html?ngResource */ 1729);
/* harmony import */ var _login_page_scss_ngResource__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./login.page.scss?ngResource */ 7047);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/forms */ 2508);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ionic/angular */ 3819);
/* harmony import */ var ngx_mask__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ngx-mask */ 446);
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./../services/user.service */ 3071);











let LoginPage = class LoginPage {
  constructor(loadingCtrl, userService, router, nav, modalController, toastController, maskPipe, formBuilder) {
    this.loadingCtrl = loadingCtrl;
    this.userService = userService;
    this.router = router;
    this.nav = nav;
    this.modalController = modalController;
    this.toastController = toastController;
    this.maskPipe = maskPipe;
    this.formBuilder = formBuilder;
    this.phone_model = "";
    this.phone_error = "";
    this.pwd_error = "";
    this.error_response = "";
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.ionicForm = this.formBuilder.group({
      phone: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_4__.Validators.required]],
      password: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_4__.Validators.required]]
    });
  }

  updateWithMask(event) {
    this.ionicForm.controls.phone.setValue(this.maskPipe.transform(event.currentTarget.value, '(000) 000-00-00'));
  }

  submitForm() {
    var _this = this;

    return (0,_Users_govorkovalexander_Desktop_Zaec_bbox_bbox_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
      _this.phone_error = "";
      _this.pwd_error = "";
      _this.error_response = "";
      console.log(_this.ionicForm.value);
      let phone = _this.ionicForm.value.phone;
      let password = _this.ionicForm.value.password;

      if (phone == '') {
        _this.phone_error = "Телефон не может быть пустым!";
      }

      if (password == '') {
        _this.pwd_error = "Пароль не может быть пустым!";
      }

      if (phone != '' && password != '') {
        const loading = yield _this.loadingCtrl.create({
          message: 'Подождите...'
        });
        loading.present();

        _this.userService.login(phone, password).then(response => {
          loading.dismiss();

          if (response.error) {
            _this.error_response = response.message;
          } else {
            _this.nav.navigateRoot(['orders']);
          }
        }).catch(err => {
          console.log("login.ts this.userService.login error:");
          console.log(err);
          loading.dismiss();
        });
      }
    })();
  }

  pwdSetFocus() {
    this.password.setFocus();
  }

};

LoginPage.ctorParameters = () => [{
  type: _ionic_angular__WEBPACK_IMPORTED_MODULE_5__.LoadingController
}, {
  type: _services_user_service__WEBPACK_IMPORTED_MODULE_3__.UserService
}, {
  type: _angular_router__WEBPACK_IMPORTED_MODULE_6__.Router
}, {
  type: _ionic_angular__WEBPACK_IMPORTED_MODULE_5__.NavController
}, {
  type: _ionic_angular__WEBPACK_IMPORTED_MODULE_5__.ModalController
}, {
  type: _ionic_angular__WEBPACK_IMPORTED_MODULE_5__.ToastController
}, {
  type: ngx_mask__WEBPACK_IMPORTED_MODULE_7__.MaskPipe
}, {
  type: _angular_forms__WEBPACK_IMPORTED_MODULE_4__.FormBuilder
}];

LoginPage.propDecorators = {
  phone: [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_8__.ViewChild,
    args: ['phone']
  }],
  password: [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_8__.ViewChild,
    args: ['password']
  }]
};
LoginPage = (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__decorate)([(0,_angular_core__WEBPACK_IMPORTED_MODULE_8__.Component)({
  selector: 'app-login',
  template: _login_page_html_ngResource__WEBPACK_IMPORTED_MODULE_1__,
  styles: [_login_page_scss_ngResource__WEBPACK_IMPORTED_MODULE_2__]
})], LoginPage);


/***/ }),

/***/ 7047:
/*!**************************************************!*\
  !*** ./src/app/login/login.page.scss?ngResource ***!
  \**************************************************/
/***/ ((module) => {

module.exports = "div.top_image {\n  position: absolute;\n  top: 0px;\n  width: 100%;\n  z-index: 0;\n}\ndiv.top_image img {\n  width: 100%;\n}\ndiv.bottom_image {\n  position: absolute;\n  bottom: 0px;\n  width: 100%;\n  z-index: 0;\n}\ndiv.bottom_image img {\n  width: 100%;\n}\ndiv.login_form {\n  height: 500px;\n  max-width: 370px;\n  width: 100%;\n  z-index: 1;\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n}\ndiv.login_form div.logo {\n  text-align: center;\n}\ndiv.login_form div.logo img {\n  width: 117px;\n}\ndiv.login_form div.logo_text {\n  padding-top: 5px;\n  text-align: center;\n  font-family: \"Montserrat\";\n  font-style: normal;\n  font-weight: 600;\n  font-size: 14px;\n  line-height: 14px;\n  color: #373737;\n  padding-bottom: 40px;\n}\ndiv.login_form div.input-field {\n  width: 280px;\n  margin: auto;\n  padding-top: 5px;\n}\ndiv.login_form div.input-field div.label {\n  font-style: normal;\n  font-weight: 500;\n  font-size: 8px;\n  line-height: 18px;\n  display: flex;\n  align-items: center;\n  color: #373737;\n  padding-left: 20px;\n}\ndiv.login_form div.input-field div.input {\n  height: 44px;\n  background: #FFFFFF;\n  border: 1px solid #373737;\n  border-radius: 40px;\n}\ndiv.login_form div.input-field div.input img.icon {\n  width: 22px;\n  position: relative;\n  top: 9px;\n  left: 22px;\n  float: left;\n}\ndiv.login_form div.input-field div.input ion-input {\n  position: relative;\n  left: 30px;\n  width: 200px;\n}\ndiv.login_form div.login-button {\n  padding-top: 20px;\n}\ndiv.login_form div.login-button ion-button {\n  --border-radius:40px;\n  font-weight: 600;\n  font-size: 14px;\n  height: 42px;\n}\ndiv.login_form div.connect_button {\n  padding-top: 30px;\n  font-style: normal;\n  font-weight: 600;\n  font-size: 10px;\n  line-height: 12px;\n  display: flex;\n  align-items: center;\n  color: #373737;\n}\ndiv.login_form div.connect_button ion-button {\n  --border-color: #2A4A84;\n  --border-radius:40px;\n  --border-width: 1px;\n}\ndiv.error-message {\n  font-size: 10px;\n  line-height: 12px;\n  color: rgb(247, 0, 0);\n  font-weight: 600;\n  padding-left: 14px;\n  padding-top: 3px;\n}\ndiv.error-response {\n  border-radius: 20px;\n  background-color: rgba(247, 0, 0, 0.4509803922);\n  margin-top: 15px !important;\n  padding: 10px;\n  color: #fff;\n  font-size: 15px;\n  font-weight: 600;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvZ2luLnBhZ2Uuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLGtCQUFBO0VBQ0EsUUFBQTtFQUNBLFdBQUE7RUFDQSxVQUFBO0FBQ0o7QUFBSTtFQUNJLFdBQUE7QUFFUjtBQUVBO0VBQ0ksa0JBQUE7RUFDQSxXQUFBO0VBQ0EsV0FBQTtFQUNBLFVBQUE7QUFDSjtBQUFJO0VBQ0ksV0FBQTtBQUVSO0FBRUE7RUFFSSxhQUFBO0VBQ0EsZ0JBQUE7RUFDQSxXQUFBO0VBQ0EsVUFBQTtFQUNBLGtCQUFBO0VBQ0EsU0FBQTtFQUNBLFFBQUE7RUFDQSxnQ0FBQTtBQUFKO0FBRUk7RUFDSSxrQkFBQTtBQUFSO0FBQ1E7RUFDSSxZQUFBO0FBQ1o7QUFHSTtFQUNJLGdCQUFBO0VBQ0Esa0JBQUE7RUFDQSx5QkFBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxlQUFBO0VBQ0EsaUJBQUE7RUFFQSxjQUFBO0VBQ0Esb0JBQUE7QUFGUjtBQUtJO0VBQ0ksWUFBQTtFQUNBLFlBQUE7RUFDQSxnQkFBQTtBQUhSO0FBSVE7RUFDSSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsY0FBQTtFQUNBLGlCQUFBO0VBQ0EsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsY0FBQTtFQUNBLGtCQUFBO0FBRlo7QUFLUTtFQUNJLFlBQUE7RUFDQSxtQkFBQTtFQUNBLHlCQUFBO0VBQ0EsbUJBQUE7QUFIWjtBQUtZO0VBQ0ksV0FBQTtFQUNBLGtCQUFBO0VBQ0EsUUFBQTtFQUNBLFVBQUE7RUFDQSxXQUFBO0FBSGhCO0FBTVk7RUFDSSxrQkFBQTtFQUNBLFVBQUE7RUFDQSxZQUFBO0FBSmhCO0FBU0k7RUFDSSxpQkFBQTtBQVBSO0FBUVE7RUFDSSxvQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLFlBQUE7QUFOWjtBQVVJO0VBQ0ksaUJBQUE7RUFDQSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0VBQ0EsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsY0FBQTtBQVJSO0FBVVE7RUFDSSx1QkFBQTtFQUNBLG9CQUFBO0VBQ0EsbUJBQUE7QUFSWjtBQWFBO0VBQ0ksZUFBQTtFQUNBLGlCQUFBO0VBQ0EscUJBQUE7RUFDQSxnQkFBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7QUFWSjtBQWFBO0VBQ0ksbUJBQUE7RUFDQSwrQ0FBQTtFQUNBLDJCQUFBO0VBQ0EsYUFBQTtFQUNBLFdBQUE7RUFDQSxlQUFBO0VBQ0EsZ0JBQUE7QUFWSiIsImZpbGUiOiJsb2dpbi5wYWdlLnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyJkaXYudG9wX2ltYWdlIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOjBweDtcbiAgICB3aWR0aDoxMDAlO1xuICAgIHotaW5kZXg6IDA7XG4gICAgaW1nIHtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgfVxufVxuXG5kaXYuYm90dG9tX2ltYWdlIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgYm90dG9tOjBweDtcbiAgICB3aWR0aDoxMDAlO1xuICAgIHotaW5kZXg6IDA7XG4gICAgaW1nIHtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgfVxufVxuXG5kaXYubG9naW5fZm9ybSB7XG5cbiAgICBoZWlnaHQ6IDUwMHB4O1xuICAgIG1heC13aWR0aDogMzcwcHg7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgei1pbmRleDogMTtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgbGVmdDogNTAlO1xuICAgIHRvcDo1MCU7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG5cbiAgICBkaXYubG9nbyB7XG4gICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgaW1nIHtcbiAgICAgICAgICAgIHdpZHRoOiAxMTdweDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpdi5sb2dvX3RleHQge1xuICAgICAgICBwYWRkaW5nLXRvcDo1cHg7XG4gICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgZm9udC1mYW1pbHk6ICdNb250c2VycmF0JztcbiAgICAgICAgZm9udC1zdHlsZTogbm9ybWFsO1xuICAgICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICAgIGxpbmUtaGVpZ2h0OiAxNHB4O1xuXG4gICAgICAgIGNvbG9yOiAjMzczNzM3O1xuICAgICAgICBwYWRkaW5nLWJvdHRvbTogNDBweDtcbiAgICB9XG5cbiAgICBkaXYuaW5wdXQtZmllbGQge1xuICAgICAgICB3aWR0aDogMjgwcHg7XG4gICAgICAgIG1hcmdpbjogYXV0bztcbiAgICAgICAgcGFkZGluZy10b3A6IDVweDtcbiAgICAgICAgZGl2LmxhYmVsIHtcbiAgICAgICAgICAgIGZvbnQtc3R5bGU6IG5vcm1hbDtcbiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICAgICAgICBmb250LXNpemU6IDhweDtcbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxOHB4O1xuICAgICAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgICAgICBjb2xvcjogIzM3MzczNztcbiAgICAgICAgICAgIHBhZGRpbmctbGVmdDogMjBweDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRpdi5pbnB1dCB7XG4gICAgICAgICAgICBoZWlnaHQ6IDQ0cHg7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAjRkZGRkZGO1xuICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgIzM3MzczNztcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDQwcHg7XG5cbiAgICAgICAgICAgIGltZy5pY29uIHtcbiAgICAgICAgICAgICAgICB3aWR0aDogMjJweDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICAgICAgdG9wOiA5cHg7XG4gICAgICAgICAgICAgICAgbGVmdDogMjJweDtcbiAgICAgICAgICAgICAgICBmbG9hdDpsZWZ0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpb24taW5wdXQge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICAgICAgICBsZWZ0OiAzMHB4O1xuICAgICAgICAgICAgICAgIHdpZHRoOiAyMDBweDsgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGl2LmxvZ2luLWJ1dHRvbiB7XG4gICAgICAgIHBhZGRpbmctdG9wOiAyMHB4O1xuICAgICAgICBpb24tYnV0dG9uIHtcbiAgICAgICAgICAgIC0tYm9yZGVyLXJhZGl1czo0MHB4O1xuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDsgICAgXG4gICAgICAgICAgICBoZWlnaHQ6IDQycHg7ICAgICAgICBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpdi5jb25uZWN0X2J1dHRvbiB7XG4gICAgICAgIHBhZGRpbmctdG9wOiAzMHB4O1xuICAgICAgICBmb250LXN0eWxlOiBub3JtYWw7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICAgIGZvbnQtc2l6ZTogMTBweDtcbiAgICAgICAgbGluZS1oZWlnaHQ6IDEycHg7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIGNvbG9yOiAjMzczNzM3O1xuXG4gICAgICAgIGlvbi1idXR0b24ge1xuICAgICAgICAgICAgLS1ib3JkZXItY29sb3I6ICMyQTRBODQ7XG4gICAgICAgICAgICAtLWJvcmRlci1yYWRpdXM6NDBweDtcbiAgICAgICAgICAgIC0tYm9yZGVyLXdpZHRoOiAxcHg7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmRpdi5lcnJvci1tZXNzYWdlIHtcbiAgICBmb250LXNpemU6IDEwcHg7XG4gICAgbGluZS1oZWlnaHQ6IDEycHg7XG4gICAgY29sb3I6IHJnYigyNDcsIDAsIDApO1xuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgcGFkZGluZy1sZWZ0OiAxNHB4O1xuICAgIHBhZGRpbmctdG9wOiAzcHg7XG59XG5cbmRpdi5lcnJvci1yZXNwb25zZSB7XG4gICAgYm9yZGVyLXJhZGl1czogMjBweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjcwMDAwNzM7XG4gICAgbWFyZ2luLXRvcDogMTVweCAhaW1wb3J0YW50O1xuICAgIHBhZGRpbmc6IDEwcHg7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udC1zaXplOiAxNXB4OyAgICBcbiAgICBmb250LXdlaWdodDogNjAwO1xufSJdfQ== */";

/***/ }),

/***/ 1729:
/*!**************************************************!*\
  !*** ./src/app/login/login.page.html?ngResource ***!
  \**************************************************/
/***/ ((module) => {

module.exports = "<ion-content>\n  \n  <div class=\"top_image\">\n    <img src=\"../../assets/top_image.png\">\n  </div>\n\n  <div class=\"login_form\">\n\n    <div class=\"logo\">\n      <img src=\"../../assets/logo.png\">\n    </div>\n\n    <div class=\"logo_text\">\n      Покупки по всему миру с дешёвой доставкой\n    </div>\n\n    <div class=\"form\">\n      <form [formGroup]=\"ionicForm\" (ngSubmit)=\"submitForm()\" novalidate>\n        <div class=\"login input-field\">\n          <div class=\"label\">Номер телефона</div>\n          <div class=\"input\">\n            <img class=\"icon\" src=\"../../assets/user.png\">\n            <ion-input (ionChange)=\"updateWithMask($event)\" type=\"tel\" inputmode=\"tel\" #phone formControlName=\"phone\" [autofocus]=\"true\" (keyup.enter)=\"pwdSetFocus()\" >+7</ion-input>\n          </div>\n           <div class=\"error-message\"  *ngIf=\"phone_error!=''\">Это обязательное поле!</div>\n        </div>\n\n\n        \n        <div class=\"input-field password \">\n          <div class=\"label\">Пароль</div>\n          <div class=\"input\">\n            <img class=\"icon\" src=\"../../assets/pwd.png\">\n            <ion-input type=\"password\" inputmode=\"text\" formControlName=\"password\" #password (keyup.enter)=\"submitForm()\"></ion-input>\n          </div>\n          <div class=\"error-message\" *ngIf=\"pwd_error!=''\">Это обязательное поле!</div>\n        </div>\n\n        <div class=\"input-field error-response\" *ngIf=\"error_response!=''\" [innerHtml]=\"error_response\"></div>\n\n        <div class=\"input-field login-button\">\n          <ion-button color=\"button-color\" expand=\"block\" (click)=\"submitForm()\">АВТОРИЗОВАТЬСЯ</ion-button>\n        </div>\n\n        <div class=\"input-field login-button\">\n          <div class=\"connect_button\">\n            <ion-grid >\n              <ion-row class=\"ion-align-items-center\">\n                <ion-col size=\"3\" class=\"ion-text-left\">\n                  <ion-button   color=\"button-white\" class=\"white-call-button\" href=\"https://wa.me/79060510120\">\n                    <img src=\"../../assets/whatsapp.png\">\n                  </ion-button>\n                </ion-col>\n                <ion-col size=\"6\" class=\"ion-text-center\">СВЯЗАТЬСЯ</ion-col>\n                <ion-col size=\"3\" class=\"ion-text-left\">\n                  <ion-button   color=\"button-white\" class=\"white-call-button\" href=\"https://t.me/agcentory240\"> \n                    <img src=\"../../assets/telegram.png\">\n                  </ion-button>\n                </ion-col>\n              </ion-row>\n            </ion-grid>\n          </div>\n        </div>\n\n      </form>\n    </div>\n\n\n\n  </div>\n\n  <div class=\"bottom_image\">\n    <img src=\"../../assets/bottom_image.png\">\n  </div>\n\n</ion-content>";

/***/ })

}]);
//# sourceMappingURL=src_app_login_login_module_ts.js.map
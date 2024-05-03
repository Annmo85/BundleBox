"use strict";
(self["webpackChunkapp"] = self["webpackChunkapp"] || []).push([["src_app_start_start_module_ts"],{

/***/ 9654:
/*!***********************************************!*\
  !*** ./src/app/start/start-routing.module.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StartPageRoutingModule": () => (/* binding */ StartPageRoutingModule)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _start_page__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./start.page */ 5104);




const routes = [
    {
        path: '',
        component: _start_page__WEBPACK_IMPORTED_MODULE_0__.StartPage
    }
];
let StartPageRoutingModule = class StartPageRoutingModule {
};
StartPageRoutingModule = (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.NgModule)({
        imports: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule.forChild(routes)],
        exports: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule],
    })
], StartPageRoutingModule);



/***/ }),

/***/ 8030:
/*!***************************************!*\
  !*** ./src/app/start/start.module.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StartPageModule": () => (/* binding */ StartPageModule)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/forms */ 2508);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ionic/angular */ 3819);
/* harmony import */ var _start_routing_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./start-routing.module */ 9654);
/* harmony import */ var _start_page__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./start.page */ 5104);







let StartPageModule = class StartPageModule {
};
StartPageModule = (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.NgModule)({
        imports: [
            _angular_common__WEBPACK_IMPORTED_MODULE_4__.CommonModule,
            _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormsModule,
            _ionic_angular__WEBPACK_IMPORTED_MODULE_6__.IonicModule,
            _start_routing_module__WEBPACK_IMPORTED_MODULE_0__.StartPageRoutingModule
        ],
        declarations: [_start_page__WEBPACK_IMPORTED_MODULE_1__.StartPage]
    })
], StartPageModule);



/***/ }),

/***/ 5104:
/*!*************************************!*\
  !*** ./src/app/start/start.page.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StartPage": () => (/* binding */ StartPage)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _start_page_html_ngResource__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./start.page.html?ngResource */ 7153);
/* harmony import */ var _start_page_scss_ngResource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./start.page.scss?ngResource */ 6670);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./../services/user.service */ 3071);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ionic/angular */ 3819);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/environments/environment */ 2340);








let StartPage = class StartPage {
    constructor(userService, router, nav) {
        this.userService = userService;
        this.router = router;
        this.nav = nav;
    }
    ngOnInit() {
        let phone = localStorage.getItem(src_environments_environment__WEBPACK_IMPORTED_MODULE_3__.environment.prefix + 'user_phone');
        let password = localStorage.getItem(src_environments_environment__WEBPACK_IMPORTED_MODULE_3__.environment.prefix + 'user_password');
        this.userService.login(phone, password).then(response => {
            if (response.error) {
                this.nav.navigateRoot(['login']);
            }
            else {
                this.nav.navigateRoot(['orders']);
            }
        });
    }
};
StartPage.ctorParameters = () => [
    { type: _services_user_service__WEBPACK_IMPORTED_MODULE_2__.UserService },
    { type: _angular_router__WEBPACK_IMPORTED_MODULE_4__.Router },
    { type: _ionic_angular__WEBPACK_IMPORTED_MODULE_5__.NavController }
];
StartPage = (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_7__.Component)({
        selector: 'app-start',
        template: _start_page_html_ngResource__WEBPACK_IMPORTED_MODULE_0__,
        styles: [_start_page_scss_ngResource__WEBPACK_IMPORTED_MODULE_1__]
    })
], StartPage);



/***/ }),

/***/ 6670:
/*!**************************************************!*\
  !*** ./src/app/start/start.page.scss?ngResource ***!
  \**************************************************/
/***/ ((module) => {

module.exports = "div.top_image {\n  position: absolute;\n  top: 0px;\n  width: 100%;\n  z-index: 0;\n}\ndiv.top_image img {\n  width: 100%;\n}\ndiv.bottom_image {\n  position: absolute;\n  bottom: 0px;\n  width: 100%;\n  z-index: 0;\n}\ndiv.bottom_image img {\n  width: 100%;\n}\ndiv.login_form {\n  height: 500px;\n  max-width: 370px;\n  width: 100%;\n  z-index: 1;\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n}\ndiv.login_form div.logo {\n  text-align: center;\n}\ndiv.login_form div.logo img {\n  width: 117px;\n}\ndiv.login_form div.logo_text {\n  padding-top: 35px;\n  text-align: center;\n  font-family: \"Montserrat\";\n  font-style: normal;\n  font-weight: 600;\n  font-size: 14px;\n  line-height: 14px;\n  color: #373737;\n  padding-bottom: 40px;\n}\ndiv.login_form div.logo_text span.loading_text {\n  font-size: 12px;\n  font-weight: 400;\n  position: relative;\n  margin-left: 6px;\n  top: -9px;\n}\ndiv.login_form div.input-field {\n  width: 280px;\n  margin: auto;\n  padding-top: 5px;\n}\ndiv.login_form div.input-field div.label {\n  font-style: normal;\n  font-weight: 500;\n  font-size: 8px;\n  line-height: 18px;\n  display: flex;\n  align-items: center;\n  color: #373737;\n  padding-left: 20px;\n}\ndiv.login_form div.input-field div.input {\n  height: 44px;\n  background: #FFFFFF;\n  border: 1px solid #373737;\n  border-radius: 40px;\n}\ndiv.login_form div.input-field div.input img.icon {\n  width: 22px;\n  position: relative;\n  top: 9px;\n  left: 22px;\n  float: left;\n}\ndiv.login_form div.input-field div.input ion-input {\n  position: relative;\n  left: 30px;\n  width: 200px;\n}\ndiv.login_form div.login-button {\n  padding-top: 20px;\n}\ndiv.login_form div.login-button ion-button {\n  --border-radius:40px;\n  font-weight: 600;\n  font-size: 14px;\n  height: 42px;\n}\ndiv.login_form div.connect_button {\n  padding-top: 30px;\n  font-style: normal;\n  font-weight: 600;\n  font-size: 10px;\n  line-height: 12px;\n  display: flex;\n  align-items: center;\n  color: #373737;\n}\ndiv.login_form div.connect_button ion-button {\n  --border-color: #2A4A84;\n  --border-radius:40px;\n  --border-width: 1px;\n}\ndiv.error-message {\n  font-size: 10px;\n  line-height: 12px;\n  color: rgb(247, 0, 0);\n  font-weight: 600;\n  padding-left: 14px;\n  padding-top: 3px;\n}\ndiv.error-response {\n  border-radius: 20px;\n  background-color: rgba(247, 0, 0, 0.4509803922);\n  margin-top: 15px !important;\n  padding: 10px;\n  color: #fff;\n  font-size: 15px;\n  font-weight: 600;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0YXJ0LnBhZ2Uuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLGtCQUFBO0VBQ0EsUUFBQTtFQUNBLFdBQUE7RUFDQSxVQUFBO0FBQ0o7QUFBSTtFQUNJLFdBQUE7QUFFUjtBQUVBO0VBQ0ksa0JBQUE7RUFDQSxXQUFBO0VBQ0EsV0FBQTtFQUNBLFVBQUE7QUFDSjtBQUFJO0VBQ0ksV0FBQTtBQUVSO0FBRUE7RUFFSSxhQUFBO0VBQ0EsZ0JBQUE7RUFDQSxXQUFBO0VBQ0EsVUFBQTtFQUNBLGtCQUFBO0VBQ0EsU0FBQTtFQUNBLFFBQUE7RUFDQSxnQ0FBQTtBQUFKO0FBRUk7RUFDSSxrQkFBQTtBQUFSO0FBQ1E7RUFDSSxZQUFBO0FBQ1o7QUFHSTtFQUNJLGlCQUFBO0VBQ0Esa0JBQUE7RUFDQSx5QkFBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxlQUFBO0VBQ0EsaUJBQUE7RUFFQSxjQUFBO0VBQ0Esb0JBQUE7QUFGUjtBQUlRO0VBQ0ksZUFBQTtFQUNBLGdCQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtFQUNBLFNBQUE7QUFGWjtBQU1JO0VBQ0ksWUFBQTtFQUNBLFlBQUE7RUFDQSxnQkFBQTtBQUpSO0FBS1E7RUFDSSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsY0FBQTtFQUNBLGlCQUFBO0VBQ0EsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsY0FBQTtFQUNBLGtCQUFBO0FBSFo7QUFNUTtFQUNJLFlBQUE7RUFDQSxtQkFBQTtFQUNBLHlCQUFBO0VBQ0EsbUJBQUE7QUFKWjtBQU1ZO0VBQ0ksV0FBQTtFQUNBLGtCQUFBO0VBQ0EsUUFBQTtFQUNBLFVBQUE7RUFDQSxXQUFBO0FBSmhCO0FBT1k7RUFDSSxrQkFBQTtFQUNBLFVBQUE7RUFDQSxZQUFBO0FBTGhCO0FBVUk7RUFDSSxpQkFBQTtBQVJSO0FBU1E7RUFDSSxvQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLFlBQUE7QUFQWjtBQVdJO0VBQ0ksaUJBQUE7RUFDQSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0VBQ0EsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsY0FBQTtBQVRSO0FBV1E7RUFDSSx1QkFBQTtFQUNBLG9CQUFBO0VBQ0EsbUJBQUE7QUFUWjtBQWNBO0VBQ0ksZUFBQTtFQUNBLGlCQUFBO0VBQ0EscUJBQUE7RUFDQSxnQkFBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7QUFYSjtBQWNBO0VBQ0ksbUJBQUE7RUFDQSwrQ0FBQTtFQUNBLDJCQUFBO0VBQ0EsYUFBQTtFQUNBLFdBQUE7RUFDQSxlQUFBO0VBQ0EsZ0JBQUE7QUFYSiIsImZpbGUiOiJzdGFydC5wYWdlLnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyJkaXYudG9wX2ltYWdlIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOjBweDtcbiAgICB3aWR0aDoxMDAlO1xuICAgIHotaW5kZXg6IDA7XG4gICAgaW1nIHtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgfVxufVxuXG5kaXYuYm90dG9tX2ltYWdlIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgYm90dG9tOjBweDtcbiAgICB3aWR0aDoxMDAlO1xuICAgIHotaW5kZXg6IDA7XG4gICAgaW1nIHtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgfVxufVxuXG5kaXYubG9naW5fZm9ybSB7XG5cbiAgICBoZWlnaHQ6IDUwMHB4O1xuICAgIG1heC13aWR0aDogMzcwcHg7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgei1pbmRleDogMTtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgbGVmdDogNTAlO1xuICAgIHRvcDo1MCU7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG5cbiAgICBkaXYubG9nbyB7XG4gICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgaW1nIHtcbiAgICAgICAgICAgIHdpZHRoOiAxMTdweDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpdi5sb2dvX3RleHQge1xuICAgICAgICBwYWRkaW5nLXRvcDozNXB4O1xuICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgIGZvbnQtZmFtaWx5OiAnTW9udHNlcnJhdCc7XG4gICAgICAgIGZvbnQtc3R5bGU6IG5vcm1hbDtcbiAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICBsaW5lLWhlaWdodDogMTRweDtcblxuICAgICAgICBjb2xvcjogIzM3MzczNztcbiAgICAgICAgcGFkZGluZy1ib3R0b206IDQwcHg7XG5cbiAgICAgICAgc3Bhbi5sb2FkaW5nX3RleHQge1xuICAgICAgICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICAgIG1hcmdpbi1sZWZ0OiA2cHg7XG4gICAgICAgICAgICB0b3A6IC05cHg7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXYuaW5wdXQtZmllbGQge1xuICAgICAgICB3aWR0aDogMjgwcHg7XG4gICAgICAgIG1hcmdpbjogYXV0bztcbiAgICAgICAgcGFkZGluZy10b3A6IDVweDtcbiAgICAgICAgZGl2LmxhYmVsIHtcbiAgICAgICAgICAgIGZvbnQtc3R5bGU6IG5vcm1hbDtcbiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICAgICAgICBmb250LXNpemU6IDhweDtcbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxOHB4O1xuICAgICAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgICAgICBjb2xvcjogIzM3MzczNztcbiAgICAgICAgICAgIHBhZGRpbmctbGVmdDogMjBweDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRpdi5pbnB1dCB7XG4gICAgICAgICAgICBoZWlnaHQ6IDQ0cHg7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAjRkZGRkZGO1xuICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgIzM3MzczNztcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDQwcHg7XG5cbiAgICAgICAgICAgIGltZy5pY29uIHtcbiAgICAgICAgICAgICAgICB3aWR0aDogMjJweDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICAgICAgdG9wOiA5cHg7XG4gICAgICAgICAgICAgICAgbGVmdDogMjJweDtcbiAgICAgICAgICAgICAgICBmbG9hdDpsZWZ0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpb24taW5wdXQge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICAgICAgICBsZWZ0OiAzMHB4O1xuICAgICAgICAgICAgICAgIHdpZHRoOiAyMDBweDsgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGl2LmxvZ2luLWJ1dHRvbiB7XG4gICAgICAgIHBhZGRpbmctdG9wOiAyMHB4O1xuICAgICAgICBpb24tYnV0dG9uIHtcbiAgICAgICAgICAgIC0tYm9yZGVyLXJhZGl1czo0MHB4O1xuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDsgICAgXG4gICAgICAgICAgICBoZWlnaHQ6IDQycHg7ICAgICAgICBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpdi5jb25uZWN0X2J1dHRvbiB7XG4gICAgICAgIHBhZGRpbmctdG9wOiAzMHB4O1xuICAgICAgICBmb250LXN0eWxlOiBub3JtYWw7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICAgIGZvbnQtc2l6ZTogMTBweDtcbiAgICAgICAgbGluZS1oZWlnaHQ6IDEycHg7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIGNvbG9yOiAjMzczNzM3O1xuXG4gICAgICAgIGlvbi1idXR0b24ge1xuICAgICAgICAgICAgLS1ib3JkZXItY29sb3I6ICMyQTRBODQ7XG4gICAgICAgICAgICAtLWJvcmRlci1yYWRpdXM6NDBweDtcbiAgICAgICAgICAgIC0tYm9yZGVyLXdpZHRoOiAxcHg7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmRpdi5lcnJvci1tZXNzYWdlIHtcbiAgICBmb250LXNpemU6IDEwcHg7XG4gICAgbGluZS1oZWlnaHQ6IDEycHg7XG4gICAgY29sb3I6IHJnYigyNDcsIDAsIDApO1xuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgcGFkZGluZy1sZWZ0OiAxNHB4O1xuICAgIHBhZGRpbmctdG9wOiAzcHg7XG59XG5cbmRpdi5lcnJvci1yZXNwb25zZSB7XG4gICAgYm9yZGVyLXJhZGl1czogMjBweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjcwMDAwNzM7XG4gICAgbWFyZ2luLXRvcDogMTVweCAhaW1wb3J0YW50O1xuICAgIHBhZGRpbmc6IDEwcHg7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udC1zaXplOiAxNXB4OyAgICBcbiAgICBmb250LXdlaWdodDogNjAwO1xufSJdfQ== */";

/***/ }),

/***/ 7153:
/*!**************************************************!*\
  !*** ./src/app/start/start.page.html?ngResource ***!
  \**************************************************/
/***/ ((module) => {

module.exports = "<ion-content>\n  \n  <div class=\"top_image\">\n    <img src=\"../../assets/top_image.png\">\n  </div>\n\n  <div class=\"login_form\">\n\n    <div class=\"logo\">\n      <img src=\"../../assets/logo.png\">\n    </div>\n\n    <div class=\"logo_text\">\n      <ion-spinner name=\"lines-small\" color=\"dark\"></ion-spinner>\n      <span class=\"loading_text\">Загрузка...</span>\n    </div>\n\n    <div class=\"form\">\n\n    </div>\n\n\n\n  </div>\n\n  <div class=\"bottom_image\">\n    <img src=\"../../assets/bottom_image.png\">\n  </div>\n\n</ion-content>";

/***/ })

}]);
//# sourceMappingURL=src_app_start_start_module_ts.js.map
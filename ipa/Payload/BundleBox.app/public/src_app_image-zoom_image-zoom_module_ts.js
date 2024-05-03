"use strict";
(self["webpackChunkapp"] = self["webpackChunkapp"] || []).push([["src_app_image-zoom_image-zoom_module_ts"],{

/***/ 1333:
/*!*********************************************************!*\
  !*** ./src/app/image-zoom/image-zoom-routing.module.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ImageZoomPageRoutingModule": () => (/* binding */ ImageZoomPageRoutingModule)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _image_zoom_page__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./image-zoom.page */ 1343);




const routes = [
    {
        path: '',
        component: _image_zoom_page__WEBPACK_IMPORTED_MODULE_0__.ImageZoomPage
    }
];
let ImageZoomPageRoutingModule = class ImageZoomPageRoutingModule {
};
ImageZoomPageRoutingModule = (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.NgModule)({
        imports: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule.forChild(routes)],
        exports: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule],
    })
], ImageZoomPageRoutingModule);



/***/ }),

/***/ 7421:
/*!*************************************************!*\
  !*** ./src/app/image-zoom/image-zoom.module.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ImageZoomPageModule": () => (/* binding */ ImageZoomPageModule)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/forms */ 2508);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ionic/angular */ 3819);
/* harmony import */ var _image_zoom_routing_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./image-zoom-routing.module */ 1333);
/* harmony import */ var _image_zoom_page__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./image-zoom.page */ 1343);
/* harmony import */ var swiper_angular__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! swiper/angular */ 9737);








let ImageZoomPageModule = class ImageZoomPageModule {
};
ImageZoomPageModule = (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.NgModule)({
        imports: [
            _angular_common__WEBPACK_IMPORTED_MODULE_4__.CommonModule,
            _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormsModule,
            _ionic_angular__WEBPACK_IMPORTED_MODULE_6__.IonicModule,
            swiper_angular__WEBPACK_IMPORTED_MODULE_7__.SwiperModule,
            _image_zoom_routing_module__WEBPACK_IMPORTED_MODULE_0__.ImageZoomPageRoutingModule
        ],
        declarations: [_image_zoom_page__WEBPACK_IMPORTED_MODULE_1__.ImageZoomPage]
    })
], ImageZoomPageModule);



/***/ })

}]);
//# sourceMappingURL=src_app_image-zoom_image-zoom_module_ts.js.map
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CapacitorHttp } from '@capacitor/core';
import  { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestWrapperService {

  constructor() { }

  // public get(route:string, data:any) {
  //   let new_data = data;
  //   let httpOptions: HttpOptions = {
  //     url: environment.api_url + route,
  //     method: 'GET',
  //     //responseType: 'json',
  //     params: new_data,      
  //   };
    
  //   return from(Http.get(httpOptions));
  // }


  public get(route:string,data:any):Promise<any> {
    let new_data = data;
    return  new Promise((resolve,reject) =>{
      let header = {
        'Content-Type': 'application/json',
      };
      CapacitorHttp.request({
        method: 'GET',
        url: environment.api_url + route,
        headers: header,
      }).then(response => {
        if (response.status==200) resolve(response);
        else reject(response.data)
      }).catch(error => {
        // Обработка ошибки при запросе
        reject(error);
      });
    })
  }

  public getL(route:string,data:any):Promise<any> {
    let new_data = data;
    return  new Promise((resolve,reject) =>{
      let header = {
        'Content-Type': 'application/json',
      };
      CapacitorHttp.request({
        method: 'GET',
        url: environment.api_urlL + route,
        headers: header,
      }).then(response => {
        if (response.status==200) resolve(response);
        else reject(response.data)
      }).catch(error => {
        // Обработка ошибки при запросе
        reject(error);
      });
    })
  }

  // public post(route:string, data:any):Observable<any> {
  //   let new_data = data;
 
  //   let httpOptions: HttpOptions = {
  //     url: environment.api_url + route,
  //     method: 'POST',
  //     data: new_data,
  //     responseType: "json",
  //     headers: { 'Content-Type': 'application/json' }
  //   };
  //   let return_http = from(Http.request(httpOptions));
  //   return return_http;    
  // }


  public post(route:string,data:any):Promise<any> {

    //add session data
    let new_data = data;

    return  new Promise((resolve,reject) =>{
      let header = {
        'Content-Type': 'application/json',
      };
      CapacitorHttp.request({
        method: 'POST',
        url: environment.api_url + route,
        headers: header,
        data:new_data
      }).then(response => {
        if (response.status==200 || response.status==500) resolve(response);  //????????
        else reject(response.data)
      }).catch(error => {
        // Обработка ошибки при запросе
        reject(error);
      });
    })
  }

  public postL(route:string,data:any):Promise<any> {

    //add session data
    let new_data = data;

    return  new Promise((resolve,reject) =>{
      let header = {
        'Content-Type': 'application/json',
      };
      CapacitorHttp.request({
        method: 'POST',
        url: environment.api_urlL + route,
        headers: header,
        data:new_data
      }).then(response => {
        if (response.status==200 || response.status==500) resolve(response);  //????????
        else reject(response.data)
      }).catch(error => {
        // Обработка ошибки при запросе
        reject(error);
      });
    })
  }

  // public getL(route:string, data:any) {
  //   let new_data = data;
  //   let httpOptions: HttpOptions = {
  //     url: environment.api_urlL + route,
  //     method: 'GET',
  //     //responseType: 'json',
  //     params: new_data,      
  //   };
    
  //   return from(Http.get(httpOptions));
  // }


  // public postL(route:string, data:any):Observable<any> {
  //   let new_data = data;
 
  //   let httpOptions: HttpOptions = {
  //     url: environment.api_urlL + route,
  //     method: 'POST',
  //     data: new_data,
  //     responseType: "json",
  //     headers: { 'Content-Type': 'application/json' }
  //   };
  //   let return_http = from(Http.request(httpOptions));
  //   return return_http;    
  // }

}

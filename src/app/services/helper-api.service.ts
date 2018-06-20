import {Injectable} from '@angular/core';
import {Http, Headers, URLSearchParams} from "@angular/http";

import * as _ from 'lodash';
import {LocalStorageService} from "angular-2-local-storage";

@Injectable()
export class HelperApiService {

  endpoint: string;
  headers = new Headers();

  constructor(private http: Http,
              private localStorageService: LocalStorageService) {
    this.endpoint = 'https://api.paap.vn/api/';
    this.headers.set('Content-Type', 'application/json');
    this.headers.set('X-API-Key', '6969');
  }

  authorizationHeader() {
    this.headers.delete('X-Auth-Token');
    this.headers.append('X-Auth-Token', this.localStorageService.get('userData')['token']);
  }


  getApi(resource, params = null, authenticate = false) {
    if (authenticate) {
      this.authorizationHeader();
    }
    let url_params = new URLSearchParams();
    if (params !== null) {
      _.forEach(params, function (value, key: string) {
        if(typeof value === 'object') {
          value = JSON.stringify(value);
        }
        url_params.set(key, value);
      });
    }
    return this.http.get(this.endpoint + resource, {params: url_params, headers: this.headers}).map(res => res.json());
  }

  postApi(resource, data, authenticate = false) {
    if (authenticate) {
      this.authorizationHeader();
    }
    return this.http.post(this.endpoint + resource, data, {headers: this.headers}).map(res => res.json());
  }

  updateApi(resource, data, authenticate = false) {
    if (authenticate) {
      this.authorizationHeader();
    }
    return this.http.put(this.endpoint + resource, data, {headers: this.headers}).map(res => res.json());
  }

  removeApi(resource, authenticate = false) {
    if (authenticate) {
      this.authorizationHeader();
    }
    return this.http.delete(this.endpoint + resource, {headers: this.headers}).map(res => res.json());
  }

}

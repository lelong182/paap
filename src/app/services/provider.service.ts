import {EventEmitter, Injectable} from '@angular/core';
import {HelperApiService} from "./helper-api.service";
import {Observable} from "rxjs/Observable";

@Injectable()
export class ProviderService {

  isRefreshList = new EventEmitter<boolean>();
  fetchCompleted = new EventEmitter<boolean>();
  providerDataDiscounts = new EventEmitter<boolean>();
  providerDataTransports = new EventEmitter<boolean>();

  constructor(private helperApiService: HelperApiService) {
  }

  setIsRefreshList(val: boolean) {
    this.isRefreshList.emit(val);
  }

  setFetchCompleted(val: boolean) {
    this.fetchCompleted.emit(val);
  }

  setProviderDataDiscounts(val: any) {
    this.providerDataDiscounts.emit(val);
  }

  setProviderDataTransports(val: any) {
    this.providerDataTransports.emit(val);
  }

  getList(params = null, isSearch = false) {
    if (isSearch) {
      return this.helperApiService.getApi('providers/search', params);
    } else {
      return this.helperApiService.getApi('providers', params);
    }
  }

  fetchProvider(id) {
    return new Observable(observer => {
      this.getProvider(id).subscribe(
        res => {
          if (res.success) {
            observer.next(res.data);
            observer.complete();
          }
        },
        err => {
          observer.error(err);
        }
      );
    });
  }

  getProvider(id) {
    return this.helperApiService.getApi('providers/' + id);
  }

  getTickets(id) {
    return this.helperApiService.getApi('providers/' + id + '/tickets');
  }

  getReviews(id) {
    return this.helperApiService.getApi('providers/' + id + '/reviews');
  }

  createReview(id, reviewData) {
    return this.helperApiService.postApi('providers/' + id + '/reviews', reviewData, true);
  }

  create(providerData) {
    return this.helperApiService.postApi('providers', providerData, true);
  }

  update(providerData) {
    return this.helperApiService.updateApi('providers/' + providerData.id, providerData, true);
  }

  remove(id) {
    return this.helperApiService.removeApi('providers/' + id, true);
  }

}

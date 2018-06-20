import {Component, OnDestroy, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {ProviderModel} from "../../models/provider-model";
import {LocalStorageService} from "angular-2-local-storage";
import {ProviderService} from "../../services/provider.service";

@Component({
  templateUrl: './search-provider.component.html'
})
export class SearchProviderComponent implements OnInit, OnDestroy {

  listProviders: Array<ProviderModel> = [];
  subscription: Subscription;
  page: number = 0;
  total: number = 0;
  searchParam;
  visibleReadmore: boolean = true;
  direction: string = 'desc';
  sortByData;

  constructor(private title: Title,
              private localStorageService: LocalStorageService,
              private activatedRoute: ActivatedRoute,
              private providerService: ProviderService) {
    title.setTitle('PAAP | Tìm kiếm đối tác');
  }

  ngOnInit() {
    let self = this;
    self.subscription = self.activatedRoute.queryParams.subscribe(
      param => {
        self.visibleReadmore = true;
        self.page = 0;
        self.searchParam = param;
        self.loadProviders(true);
      }
    );
  }

  loadProviders(refresh = false, e?) {
    let self = this;
    $('.list-services').addClass('is-loading');
    self.providerService.getList({
      filters: {
        name: self.searchParam['name'],
        departure_id: self.searchParam['departure'],
        transport_id: self.searchParam['transport'],
      }, limit: 6, page: ++self.page, sorts: self.sortByData
    }, true).subscribe(
      res => {
        if (res.success) {
          if (res.data.paging.pages <= self.page) {
            self.visibleReadmore = false;
          }
          if (refresh) {
            self.listProviders = res.data.records;
          } else {
            self.listProviders = self.listProviders.concat(res.data.records);
          }
          self.total = res.data.paging.total;
        }
      },
      err => {
        console.log(err);
      },
      () => {
        $('.list-services').removeClass('is-loading');
        if (e !== undefined) {
          $('html, body').animate({scrollTop: e.target.offsetTop}, 800);
        }
      }
    );
  }

  sortBy(type) {
    let self = this;
    $('.list-services').addClass('is-loading');
    switch (type) {
      case 'name':
        self.sortByData = {'name': self.direction};
        break;
      case 'rating':
        self.sortByData = {'rating': self.direction};
        break;
    }
    self.page = 1;
    self.visibleReadmore = true;
    self.providerService.getList({
      filters: {
        departure_id: self.searchParam['departure'],
        transport_id: self.searchParam['transport']
      }, sorts: self.sortByData, limit: 10
    }, true).subscribe(
      res => {
        if (res.success) {
          if (res.data.paging.pages <= self.page) {
            self.visibleReadmore = false;
          }
          self.listProviders = res.data.records;
        }
      },
      err => {
        console.log(err);
      },
      () => {
        $('.list-services').removeClass('is-loading');
      }
    );
    self.direction = self.direction === 'desc' ? 'asc' : 'desc';
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.localStorageService.remove('filterDataProvider');
  }
}

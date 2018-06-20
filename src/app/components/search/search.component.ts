import {Component, OnInit, OnDestroy, HostBinding} from '@angular/core';
import {slideInDownAnimation} from '../../animations';
import {PaapModel} from '../../models/paap-model';
import {Title} from '@angular/platform-browser';
import {PaapService} from '../../services/paap.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {LocalStorageService} from 'angular-2-local-storage';

declare let $;

@Component({
  templateUrl: './search.component.html',
  animations: [slideInDownAnimation]
})
export class SearchComponent implements OnInit, OnDestroy {

  @HostBinding('@routeAnimation') routeAnimation = true;
  @HostBinding('style.display') display = 'block';
  listPaaps: Array<PaapModel> = [];
  subscription: Subscription;
  page = 0;
  total = 0;
  searchParam;
  visibleReadmore = true;
  direction = 'desc';
  sortByData;

  constructor(private title: Title,
              private activatedRoute: ActivatedRoute,
              private localStorageService: LocalStorageService,
              private paapService: PaapService) {
    title.setTitle('PAAP | Tìm kiếm');
  }

  ngOnInit() {
    const self = this;
    self.sortByData = {'arrival_datetime': self.direction};
    self.subscription = self.activatedRoute.queryParams.subscribe(
      param => {
        self.visibleReadmore = true;
        self.page = 0;
        self.searchParam = param;
        self.loadPaaps(true);
      }
    );
  }

  loadPaaps(refresh = false, e?) {
    const self = this;
    $('.list-paaps').addClass('is-loading');
    self.paapService.getList({
      filters: {
        departureId: self.searchParam['departureId'],
        destinationId: self.searchParam['destinationId'],
        transport_id: self.searchParam['transportId']
      }, limit: 10, page: ++self.page, sorts: self.sortByData
    }, true).subscribe(
      res => {
        if (res.success) {
          const records = res.data['records'];
          const paging = res.data['paging'];
          if (paging.pages <= self.page) {
            self.visibleReadmore = false;
          }
          if (refresh) {
            self.listPaaps = records;
          } else {
            self.listPaaps = self.listPaaps.concat(records);
          }
          self.total = paging.total;
        }
      },
      err => {
        console.log(err);
      },
      () => {
        $('.list-paaps').removeClass('is-loading');
        if (e !== undefined) {
          $('html, body').animate({scrollTop: e.target.offsetTop}, 800);
        }
      }
    );
  }

  sortBy(type) {
    const self = this;
    $('.list-paaps').addClass('is-loading');
    switch (type) {
      case 'start_date':
        self.sortByData = {'arrival_datetime': self.direction};
        break;
      case 'arrival':
        self.sortByData = {'departureId': self.direction};
        break;
      case 'departure':
        self.sortByData = {'destinationId': self.direction};
        break;
      case 'transport':
        self.sortByData = {'transport_name': self.direction};
        break;
    }
    self.page = 1;
    self.visibleReadmore = true;
    self.paapService.getList({
      filters: {
        departureId: self.searchParam['departureId'],
        destinationId: self.searchParam['destinationId'],
        transport_id: self.searchParam['transportId']
      }, sorts: self.sortByData, limit: 10
    }, true).subscribe(
      res => {
        if (res.success) {
          if (res.data.paging.pages <= self.page) {
            self.visibleReadmore = false;
          }
          self.listPaaps = res.data.records;
        }
      },
      err => {
        console.log(err);
      },
      () => {
        $('.list-paaps').removeClass('is-loading');
      }
    );
    self.direction = self.direction === 'desc' ? 'asc' : 'desc';
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.localStorageService.remove('filterData');
  }

}

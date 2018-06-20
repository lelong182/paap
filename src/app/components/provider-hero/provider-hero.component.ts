import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/observable/empty";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/map";
import {Router} from "@angular/router";
import {LocalStorageService} from "angular-2-local-storage";
import {AppService} from "../../services/app.service";

declare let $;

@Component({
  selector: 'paap-provider-hero',
  templateUrl: './provider-hero.component.html'
})
export class ProviderHeroComponent implements OnInit, AfterViewInit {

  listTransport: any = [];
  page: number = 0;
  @ViewChild('wrapDeparture') wrapDeparture: ElementRef;
  @ViewChild('departureInput') departureInput: ElementRef;
  departure;
  listDeparture: Observable<any>;
  listDeparture2: Array<{ id: string, address: string }> = [];
  departureKeyword: string = '';
  isOpenedDeparture: boolean = false;
  isReachEnd: boolean = true;
  filterData: any = {
    name: '',
    departure_id: 0,
    departure_address: '',
    transport_id: 0
  };

  constructor(private router: Router,
              private localStorageService: LocalStorageService,
              private appService: AppService) {
  }

  ngOnInit() {
    let self = this;
    let filterDataSaved = self.localStorageService.get('filterDataProvider');
    if (filterDataSaved) {
      self.filterData = filterDataSaved;
      self.departure = self.filterData.departure_address;
    }
    let listTransportSaved = self.localStorageService.get('listTransport');
    if (listTransportSaved) {
      self.listTransport = listTransportSaved;
    } else {
      self.appService.hasFinishedTransportList.subscribe(res => {
        if (res) {
          self.listTransport = self.localStorageService.get('listTransport');
        }
      });
    }
    self.listDeparture = Observable.fromEvent(self.departureInput.nativeElement, 'keyup')
      .map((res: any) => res.target.value).debounceTime(400).distinctUntilChanged()
      .switchMap(departure => {
        self.departureKeyword = departure.trim();
        if (self.departureKeyword === '') {
          self.filterData.departure_id = 0;
          self.filterData.departure_address = '';
          self.isOpenedDeparture = false;
          self.isReachEnd = true;
          self.page = 1;
          $(self.wrapDeparture.nativeElement).find('.list-location').removeClass('open');
          $(self.wrapDeparture.nativeElement).find('.location-item').remove();
          $(self.wrapDeparture.nativeElement).find('.no-result').remove();
          return Observable.empty();
        } else {
          self.isOpenedDeparture = true;
          return self.appService.getListLocation({q: self.departureKeyword, limit: 10, page: 1}).map(res => {
            self.listDeparture2 = res.data.records;
            return self.listDeparture2;
          });
        }
      }).share();
  }

  loadMoreDeparture(page) {
    let self = this;
    let listLocationDeparture = $(self.wrapDeparture.nativeElement).find('.list-location');
    self.isReachEnd = false;
    listLocationDeparture.addClass('is-loading');
    return new Observable(observe => {
      self.appService.getListLocation({q: self.departureKeyword, limit: 10, page: page}).subscribe(
        res => {
          if (res.data.paging.pages > page) {
            self.listDeparture2 = self.listDeparture2.concat(res.data.records);
            self.isReachEnd = true;
          } else {
            self.isReachEnd = false;
            listLocationDeparture.removeClass('is-loading');
          }
          observe.next(self.listDeparture2);
          observe.complete();
        }, err => {
          console.log(err);
        }, () => {
          self.isReachEnd = true;
          setTimeout(() => {
            listLocationDeparture.removeClass('is-loading');
          }, 500);
        });
    });
  }

  ngAfterViewInit() {
    let self = this;
    let $listLocation = $('.list-location');
    $(document).on('click', 'body', (event) => {
      if (!$listLocation.is(event.target) && $listLocation.has(event.target).length === 0 && !$('.wrap-search-location .custom-input').is(event.target)) {
        $listLocation.removeClass('open');
        $('.location-item').remove();
        self.isOpenedDeparture = false;
        self.isReachEnd = true;
        self.page = 1;

        self.listDeparture = Observable.fromEvent(self.departureInput.nativeElement, 'keyup')
          .map((res: any) => res.target.value).debounceTime(400).distinctUntilChanged()
          .switchMap(departure => {
            self.departureKeyword = departure.trim();
            if (self.departureKeyword === '') {
              self.filterData.departure_id = 0;
              self.filterData.departure_address = '';
              self.isOpenedDeparture = false;
              self.isReachEnd = true;
              self.page = 1;
              $(self.wrapDeparture.nativeElement).find('.list-location').removeClass('open');
              $(self.wrapDeparture.nativeElement).find('.location-item').remove();
              $(self.wrapDeparture.nativeElement).find('.no-result').remove();
              return Observable.empty();
            } else {
              self.isOpenedDeparture = true;
              return self.appService.getListLocation({q: self.departureKeyword, limit: 10, page: 1}).map(res => {
                self.listDeparture2 = res.data.records;
                return self.listDeparture2;
              });
            }
          }).share();
      }
    });

    $(self.wrapDeparture.nativeElement).find('.list-location-inner > div').on('ps-y-reach-end', function () {
      let current_height = $(this).height();
      let ul_max_height = $(this).css('max-height');
      ul_max_height = ul_max_height.substring(0, ul_max_height.length - 2);
      if (current_height >= ul_max_height && $(this).text().trim() !== '' && $(this).find('.no-result').length === 0 && self.isReachEnd) {
        self.listDeparture = self.loadMoreDeparture(++self.page).share();
      }
    });
  }

  selectLocation(location, type) {
    if (type === 'departure') {
      this.departure = location.address.trim();
      this.filterData.departure_address = this.departure;
      this.filterData.departure_id = location.id;
      $(this.wrapDeparture.nativeElement).find('.list-location').removeClass('open');
      $(this.wrapDeparture.nativeElement).find('.location-item').remove();
      this.isOpenedDeparture = false;
    }
  }

  select2Changed(e) {
    this.filterData.transport_id = parseInt(e.value);
  }

  searchProviders() {
    this.localStorageService.set('filterDataProvider', this.filterData);
    this.router.navigate(['/search-provider'], {
      queryParams: {
        'name': this.filterData.name,
        'departure': this.filterData.departure_id,
        'transport': this.filterData.transport_id,
      }
    });
  }

}

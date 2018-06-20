import {Component, OnInit, AfterViewInit, ElementRef, NgZone, ViewChild, Input} from '@angular/core';
import {Router} from '@angular/router';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import {AppService} from '../../services/app.service';
import {LocalStorageService} from 'angular-2-local-storage';
import {FormControl} from '@angular/forms';
import {} from '@types/googlemaps';
import {MapsAPILoader} from '@agm/core';
import * as moment from 'moment';

declare let google;

@Component({
  selector: 'paap-hero',
  templateUrl: './hero.component.html'
})
export class HeroComponent implements OnInit, AfterViewInit {

  @Input() isSearchPage = false;
  listTransport: any = [];
  @ViewChild('arrivalInput') arrivalInput: ElementRef;
  @ViewChild('departureInput') departureInput: ElementRef;
  arrival;
  departure;
  startDate;
  startDateOpts = {
    placeholder: 'Ngày đi',
    autoclose: true,
    format: 'dd-mm-yyyy',
    todayBtn: 'linked',
    todayHighlight: true,
    language: 'vi'
  };
  filterData: any = {
    arrival_id: '',
    arrival_address: '',
    departure_id: '',
    departure_address: '',
    arrival_datetime: '',
    transport_id: 0
  };

  searchControl: FormControl;
  @ViewChild('search')
  public searchElementRef: ElementRef;

  constructor(private router: Router,
              private localStorageService: LocalStorageService,
              private appService: AppService,
              private mapsAPILoader: MapsAPILoader,
              private ngZone: NgZone) {
    this.startDateOpts.placeholder = 'NGÀY ĐI';
  }

  ngOnInit() {
    const self = this;

    self.searchControl = new FormControl();
    const options: any = {
      componentRestrictions: {
        country: 'vn'
      }
    };
    self.mapsAPILoader.load().then(() => {
      const arrivalAutocomplete = new google.maps.places.Autocomplete(this.arrivalInput.nativeElement, options);
      arrivalAutocomplete.addListener('place_changed', () => {
        self.ngZone.run(() => {
          const place: google.maps.places.PlaceResult = arrivalAutocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          self.filterData.arrival_id = place.place_id;
          self.filterData.arrival_address = place.formatted_address;
        });
      });

      const departureAutocomplete = new google.maps.places.Autocomplete(this.departureInput.nativeElement, options);
      departureAutocomplete.addListener('place_changed', () => {
        self.ngZone.run(() => {
          const place: google.maps.places.PlaceResult = departureAutocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          self.filterData.departure_id = place.place_id;
          self.filterData.departure_address = place.formatted_address;
        });
      });
    });

    const filterDataSaved = self.localStorageService.get('filterData');
    if (filterDataSaved) {
      self.filterData = filterDataSaved;
      self.arrival = self.filterData.arrival_address;
      self.departure = self.filterData.departure_address;
      self.startDate = self.filterData.arrival_datetime ? moment(self.filterData.arrival_datetime).toDate() : '';
    }
    const listTransportSaved = self.localStorageService.get('listTransport');
    if (listTransportSaved) {
      self.listTransport = listTransportSaved;
    } else {
      self.appService.hasFinishedTransportList.subscribe(res => {
        if (res) {
          self.listTransport = self.localStorageService.get('listTransport');
        }
      });
    }
    self.startDateOpts.language = 'vi';
  }

  ngAfterViewInit() {
  }

  select2Changed(e) {
    this.filterData.transport_id = parseInt(e.value, 10);
  }

  searchPaap() {
    this.filterData.arrival_datetime = this.startDate;
    this.localStorageService.set('filterData', this.filterData);
    const queryParams: any = {
      'departureId': this.filterData.arrival_id,
      'destinationId': this.filterData.departure_id,
      'transportId': this.filterData.transport_id,
      'start-date': this.filterData.arrival_datetime ? moment(this.filterData.arrival_datetime).format('YYYY-MM-DD') : 0
    };
    this.router.navigate(['/search'], {queryParams: queryParams});
  }

  createPage() {
    this.router.navigate(['/create']);
  }

}

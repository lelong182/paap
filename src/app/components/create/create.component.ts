import {Component, OnInit, AfterViewInit, HostBinding, ElementRef, ViewChild, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import {slideInDownAnimation} from '../../animations';
import {Title} from '@angular/platform-browser';
import {LocalStorageService} from 'angular-2-local-storage';
import {AppService} from '../../services/app.service';
import {PaapService} from '../../services/paap.service';
import {PaapModel} from '../../models/paap-model';
import {FormControl} from '@angular/forms';
import {} from '@types/googlemaps';
import {MapsAPILoader} from '@agm/core';
import * as moment from 'moment';

declare let $, window, google;

@Component({
  templateUrl: './create.component.html',
  animations: [slideInDownAnimation]
})
export class CreateComponent implements OnInit, AfterViewInit {

  @HostBinding('@routeAnimation') routeAnimation = true;
  @HostBinding('style.display') display = 'block';
  listTransport: any = [];
  @ViewChild('arrivalInput') arrivalInput: ElementRef;
  @ViewChild('departureInput') departureInput: ElementRef;
  timeOpts = {
    placeholder: 'Chọn giờ',
    showMeridian: false,
    minuteStep: 5,
    readonly: true
  };
  startDateOpts = {
    startDate: new Date(),
    placeholder: 'Chọn ngày',
    autoclose: true,
    format: 'dd-mm-yyyy',
    todayBtn: 'linked',
    todayHighlight: true,
    language: 'vi',
    readonly: true
  };
  endDateOpts: any = {
    startDate: new Date(),
    placeholder: 'Chọn ngày',
    autoclose: true,
    format: 'dd-mm-yyyy',
    todayBtn: 'linked',
    todayHighlight: true,
    language: 'vi',
    readonly: true
  };
  datePlaceholderText = '';
  paapData = {
    departureAddress: '',
    departureId: '',
    departureName: '',
    destinationAddress: '',
    destinationId: '',
    destinationName: '',
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    transportId: 0,
    description: ''
  };
  userData;

  searchControl: FormControl;
  @ViewChild('search')
  public searchElementRef: ElementRef;

  constructor(private title: Title,
              private router: Router,
              private localStorageService: LocalStorageService,
              private paapService: PaapService,
              private appService: AppService,
              private mapsAPILoader: MapsAPILoader,
              private ngZone: NgZone) {
    title.setTitle('PAAP | Tạo PAAP');
    this.timeOpts.placeholder = 'Chọn giờ';
    this.datePlaceholderText = 'Chọn ngày';
    this.startDateOpts.placeholder = this.datePlaceholderText;
    this.endDateOpts.placeholder = this.datePlaceholderText;
    this.userData = localStorageService.get('userData');
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
          self.paapData.departureId = place.place_id;
          self.paapData.departureAddress = place.formatted_address;
          $('.blur-message-arrival').addClass('hidden').text('');
        });
      });

      const departureAutocomplete = new google.maps.places.Autocomplete(this.departureInput.nativeElement, options);
      departureAutocomplete.addListener('place_changed', () => {
        self.ngZone.run(() => {
          const place: google.maps.places.PlaceResult = departureAutocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          self.paapData.destinationId = place.place_id;
          self.paapData.destinationAddress = place.formatted_address;
          $('.blur-message-departure').addClass('hidden').text('');
        });
      });
    });

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
    self.endDateOpts.language = 'vi';
  }

  ngAfterViewInit() {
  }

  handleDateFromChange(dateFrom) {
    this.paapData.startDate = dateFrom;
    if (moment(dateFrom).isSameOrBefore(new Date())) {
      this.endDateOpts = {
        startDate: dateFrom ? dateFrom : new Date(),
        placeholder: this.datePlaceholderText,
        autoclose: true,
        format: 'dd-mm-yyyy',
        todayBtn: 'linked',
        todayHighlight: true,
        language: 'vi',
        readonly: true
      };
    } else {
      this.paapData.endTime = null;
      this.endDateOpts = {
        startDate: dateFrom ? dateFrom : new Date(),
        placeholder: this.datePlaceholderText,
        format: 'dd-mm-yyyy',
        autoclose: true,
        todayHighlight: true,
        language: 'vi',
        readonly: true
      };
    }
  }

  select2Changed(e) {
    this.paapData.transportId = parseInt(e.value, 10);
  }

  onKeydownArrival() {
    this.paapData.departureId = '';
    $('.blur-message-arrival').addClass('hidden').text('');
  }

  onBlurArrival() {
    if (this.paapData.departureAddress.trim() === '' && !$('.submit-message-arrival').is(':visible')) {
      $('.blur-message-arrival').text('Vui lòng chọn điểm khởi hành').removeClass('hidden');
    }
    if (this.paapData.departureAddress.trim() !== '' && this.paapData.departureId === '') {
      $('.blur-message-arrival').text('Điểm khởi hành chưa chính xác').removeClass('hidden');
    }
  }

  onKeydownDeparture() {
    this.paapData.destinationId = '';
    $('.blur-message-departure').addClass('hidden').text('');
  }

  onBlurDeparture() {
    if (this.paapData.destinationAddress.trim() === '' && !$('.submit-message-departure').is(':visible')) {
      $('.blur-message-departure').text('Vui lòng chọn điểm đến').removeClass('hidden');
    }
    if (this.paapData.destinationAddress.trim() !== '' && this.paapData.destinationId === '') {
      $('.blur-message-departure').text('Điểm đến chưa chính xác').removeClass('hidden');
    }
  }

  createPaap(event) {
    const self = this;
    $(event.target).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
    event.target.setAttribute('disabled', 'disabled');
    const arrivalDatetime = moment(self.paapData.startDate).format('YYYY-MM-DD') + ' ' + moment(self.paapData.startTime).format('HH:mm');
    let departureDatetime;
    if (self.paapData.endDate) {
      departureDatetime = moment(self.paapData.endDate).format('YYYY-MM-DD') + ' ' + moment(self.paapData.endTime).format('HH:mm');
    } else {
      departureDatetime = null;
    }
    this.paapService.create(new PaapModel({
      user_id: self.userData.id,
      departureId: self.paapData.departureId,
      departureName: self.paapData.departureName,
      destinationId: self.paapData.destinationId,
      destinationName: self.paapData.destinationName,
      arrival_datetime: arrivalDatetime,
      departure_datetime: departureDatetime,
      transport_id: self.paapData.transportId,
      description: self.paapData.description
    })).subscribe(
      res => {
        if (res.success) {
          window.swal({
            title: 'Thông báo',
            text: 'Bạn đã tạo PAAP thành công',
            padding: 0,
            customClass: 'paap-swal',
            allowOutsideClick: false,
            showCloseButton: false
          }).then(function () {
            self.router.navigate(['/']);
          });
        }
      },
      err => {
        $(event.target).find('.fa-spinner').remove();
        $(event.target).removeAttr('disabled');
        console.log(err);
      }
    );
  }

  cancelCreatePaap() {
    this.router.navigate(['/']);
  }

}

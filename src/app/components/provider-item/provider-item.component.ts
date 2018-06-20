import {OnInit, Component, ElementRef, Input, NgZone, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import {ProviderModel} from '../../models/provider-model';
import {ProviderService} from '../../services/provider.service';
import {AppService} from '../../services/app.service';
import {LocalStorageService} from 'angular-2-local-storage';
import {FormControl} from '@angular/forms';
import {} from '@types/googlemaps';
import {MapsAPILoader} from '@agm/core';
import * as moment from 'moment';

declare let $, window, google;

@Component({
  selector: 'paap-provider-item',
  templateUrl: './provider-item.component.html'
})
export class ProviderItemComponent implements OnInit {

  @Input() provider: ProviderModel;
  steps = {
    step1: true,
    step2: false
  };
  bookData = {
    providerId: 0,
    providerName: '',
    couponCode: '',
    withDriver: false
  };
  listTransport: any = [];
  @ViewChild('arrivalInput') arrivalInput: ElementRef;
  @ViewChild('departureInput') departureInput: ElementRef;
  page = 1;
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
  isLogin = false;
  userData;

  searchControl: FormControl;
  @ViewChild('search')
  public searchElementRef: ElementRef;

  constructor(private router: Router,
              private localStorageService: LocalStorageService,
              private providerService: ProviderService,
              private mapsAPILoader: MapsAPILoader,
              private ngZone: NgZone,
              private appService: AppService) {
    if (localStorageService.get('userData')) {
      this.isLogin = true;
      this.userData = localStorageService.get('userData');
    }
    this.timeOpts.placeholder = 'Chọn giờ';
    this.datePlaceholderText = 'Chọn ngày';
    this.startDateOpts.placeholder = this.datePlaceholderText;
    this.endDateOpts.placeholder = this.datePlaceholderText;
  }

  ngOnInit() {
    const self = this;
    self.listTransport = self.localStorageService.get('listTransport');
    self.startDateOpts.language = 'vi';
    self.endDateOpts.language = 'vi';
  }

  handleDateFromChange(dateFrom) {
    this.paapData.startDate = dateFrom;
    this.paapData.endTime = null;
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
  }

  onKeydownArrival() {
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

  select2Changed(e) {
    this.paapData.transportId = parseInt(e.value, 10);
  }

  openBookModal(providerItem) {
    const self = this;
    if (!self.isLogin) {
      self.router.navigate(['/login']);
      return false;
    }
    self.bookData.providerId = providerItem.id;
    self.bookData.providerName = providerItem.name;
    $('#book-' + providerItem.id + '-modal').modal('show');

    self.searchControl = new FormControl();
    const options: any = {
      componentRestrictions: {
        country: 'vn'
      }
    };
    self.mapsAPILoader.load().then(() => {
      const arrivalAutocomplete = new google.maps.places.Autocomplete(self.arrivalInput.nativeElement, options);
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

      const departureAutocomplete = new google.maps.places.Autocomplete(self.departureInput.nativeElement, options);
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
  }

  goStep2(providerId) {
    const self = this;
    const arrivalDatetime = moment(self.paapData.startDate).format('YYYY-MM-DD') + ' ' + moment(self.paapData.startTime).format('HH:mm');
    let departureDatetime;
    if (self.paapData.endDate) {
      departureDatetime = moment(self.paapData.endDate).format('YYYY-MM-DD') + ' ' + moment(self.paapData.endTime).format('HH:mm');
    } else {
      departureDatetime = null;
    }
    $('#info-details-' + providerId + '-tab').addClass('is-loading');
    const ticketData = {
      paap_data: {
        departureAddress: self.paapData.departureAddress,
        departureId: self.paapData.departureId,
        departureName: self.paapData.departureName,
        destinationAddress: self.paapData.destinationAddress,
        destinationId: self.paapData.destinationId,
        destinationName: self.paapData.destinationName,
        arrival_datetime: arrivalDatetime,
        departure_datetime: departureDatetime,
        transport_id: self.paapData.transportId,
        description: self.paapData.description
      },
      provider_id: this.bookData.providerId,
      discount_code: this.bookData.couponCode.trim(),
      with_driver: this.bookData.withDriver
    };
    this.appService.createTicket(ticketData).subscribe(
      res => {
        if (res.success) {
          this.steps.step2 = true;
          setTimeout(() => {
            $('#book-' + providerId + '-modal li:eq(1) a').tab('show');
          }, 100);
        }
      },
      err => {
        console.log(err);
      },
      () => {
        $('#info-details-' + providerId + '-tab').removeClass('is-loading');
      }
    );
  }

  editProvider(id) {
    this.router.navigate(['/create-provider', id]);
  }

  removeProvider(id, event) {
    const self = this;
    window.swal({
      title: 'Thông báo',
      text: 'Bạn có muốn xóa dịch vụ này không?',
      showCancelButton: true,
      padding: 0,
      customClass: 'paap-swal',
      allowOutsideClick: false,
      showCloseButton: false
    }).then(() => {
      $(event.target).closest('.service-item').addClass('is-loading');
      self.providerService.remove(id).subscribe(
        res => {
          if (res) {
            $(event.target).closest('.service-item').removeClass('is-loading');
          }
        },
        err => {
          console.log(err);
        },
        () => {
          self.providerService.setIsRefreshList(true);
        }
      );
    }, (dismiss) => {
      if (dismiss === 'cancel') {
      }
    });
  }

  renderRating(rating: number) {
    let str = '';
    for (let i = 0; i < 5; i++) {
      if (rating > 0) {
        str += '<i class="fa fa-star active"></i>';
      } else {
        str += '<i class="fa fa-star"></i>';
      }
      rating--;
    }
    return str;
  }

}

import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {LocalStorageService} from 'angular-2-local-storage';
import {PaapModel} from '../../../models/paap-model';
import {UserService} from '../../../services/user.service';
import {PaapService} from '../../../services/paap.service';
import {AppService} from '../../../services/app.service';
import {FormControl} from '@angular/forms';
import {} from '@types/googlemaps';
import {MapsAPILoader} from '@agm/core';
import * as moment from 'moment';

declare let $, window, google;

@Component({
  templateUrl: './profile.created.component.html'
})
export class ProfileCreatedComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  listPaaps: Array<PaapModel>;
  listTransport: any = [];
  paapStatus: any = [
    {
      id: 'Active',
      text: 'Đang mở'
    }, {
      id: 'InActive',
      text: 'Đã đóng'
    }
  ];
  statusSelect2Options;
  @ViewChild('wrapArrival') wrapArrival: ElementRef;
  @ViewChild('wrapDeparture') wrapDeparture: ElementRef;
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
  paapData: any = {
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
    description: '',
    status: ''
  };

  searchControl: FormControl;
  @ViewChild('search')
  public searchElementRef: ElementRef;

  constructor(private userService: UserService,
              private paapService: PaapService,
              private localStorageService: LocalStorageService,
              private mapsAPILoader: MapsAPILoader,
              private ngZone: NgZone,
              private appService: AppService) {
    this.timeOpts.placeholder = 'Chọn giờ';
    this.datePlaceholderText = 'Chọn ngày';
    this.startDateOpts.placeholder = this.datePlaceholderText;
    this.endDateOpts.placeholder = this.datePlaceholderText;
  }

  ngOnInit() {
    this.loadPaapCreated();
    const listTransportSaved = this.localStorageService.get('listTransport');
    if (listTransportSaved) {
      this.listTransport = listTransportSaved;
    } else {
      this.appService.hasFinishedTransportList.subscribe(res => {
        if (res) {
          this.listTransport = this.localStorageService.get('listTransport');
        }
      });
    }
    this.startDateOpts.language = 'vi';
    this.endDateOpts.language = 'vi';
    this.statusSelect2Options = {
      minimumResultsForSearch: -1
    };
  }

  loadPaapCreated() {
    this.listPaaps = null;
    this.subscription = this.userService.paaps().subscribe(
      res => {
        if (res.success) {
          this.listPaaps = res.data.records;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  handleClosePaap(id, event) {
    const self = this;
    $(event.target).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
    event.target.setAttribute('disabled', 'disabled');
    self.paapService.update(id, {status: 'InActive'}).subscribe(
      res => {
        if (res.success) {
          window.swal({
            title: 'Thông báo',
            text: 'Đã đóng PAAP thành công',
            padding: 0,
            customClass: 'paap-swal',
            allowOutsideClick: false,
            showCloseButton: false
          }).then(function () {
            self.loadPaapCreated();
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
        autoclose: true,
        format: 'dd-mm-yyyy',
        todayHighlight: true,
        language: 'vi',
        readonly: true
      };
    }
  }

  select2StatusChanged(e) {
    this.paapData.status = e.value;
  }

  select2Changed(e) {
    this.paapData.transportId = parseInt(e.value, 10);
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

  openPaapModal(paapItem) {
    const self = this;
    self.paapData = {
      departureAddress: paapItem.departureAddress,
      departureId: paapItem.departureId,
      departureName: paapItem.departureName,
      destinationAddress: paapItem.destinationAddress,
      destinationId: paapItem.destinationId,
      destinationName: paapItem.destinationName,
      startDate: moment(paapItem.arrival_datetime, 'YYYY-MM-DD HH:mm').toDate(),
      startTime: moment(paapItem.arrival_datetime, 'YYYY-MM-DD HH:mm').toDate(),
      endDate: moment(paapItem.departure_datetime, 'YYYY-MM-DD HH:mm').toDate(),
      endTime: moment(paapItem.departure_datetime, 'YYYY-MM-DD HH:mm').toDate(),
      transportId: paapItem.transport_id,
      description: paapItem.description,
      status: paapItem.status
    };
    $('#paap-' + paapItem.id + '-modal').modal('show');

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

  updatePaap(id, event) {
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
    this.paapService.update(id, new PaapModel({
      departureAddress: self.paapData.departureAddress,
      departureId: self.paapData.departureId,
      departureName: self.paapData.departureName,
      destinationAddress: self.paapData.destinationAddress,
      destinationId: self.paapData.destinationId,
      destinationName: self.paapData.destinationName,
      arrival_datetime: arrivalDatetime,
      departure_datetime: departureDatetime,
      transport_id: self.paapData.transportId,
      description: self.paapData.description,
      status: self.paapData.status
    })).subscribe(
      res => {
        if (res.success) {
          window.swal({
            title: 'Thông báo',
            text: 'Cập nhật PAAP thành công',
            padding: 0,
            customClass: 'paap-swal',
            allowOutsideClick: false,
            showCloseButton: false
          }).then(function () {
            self.loadPaapCreated();
            $('#paap-' + id + '-modal').modal('hide');
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

  cancelUpdatePaap(id) {
    $('#paap-' + id + '-modal').modal('hide');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}

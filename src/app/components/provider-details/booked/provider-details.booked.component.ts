import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import {LocalStorageService} from 'angular-2-local-storage';
import {AppService} from '../../../services/app.service';
import {ProviderService} from '../../../services/provider.service';
import {UserService} from '../../../services/user.service';
import {FormControl} from '@angular/forms';
import {} from '@types/googlemaps';
import {MapsAPILoader} from '@agm/core';
import * as _ from 'lodash';
import * as moment from 'moment';

declare let $, window, google;

@Component({
  templateUrl: './provider-details.booked.component.html'
})
export class ProviderDetailsBookedComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  tickets;
  userDatas = [{
    id: 0,
    avatar: '',
    fullname: '',
    email: '',
    phone: ''
  }];
  userData;
  listTransport: any = [];
  ticketStatus: any = [
    {
      id: 'Active',
      text: 'Đang mở'
    }, {
      id: 'Processing',
      text: 'Đang xử lý'
    }, {
      id: 'Confirmed',
      text: 'Đã xác nhận'
    }, {
      id: 'InActive',
      text: 'Đã đóng'
    }
  ];
  statusSelect2Options;
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
  ticketData: any = {
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
    status: '',
    price: 0,
    withDriver: false
  };

  searchControl: FormControl;
  @ViewChild('search')
  public searchElementRef: ElementRef;

  constructor(private router: Router,
              private providerService: ProviderService,
              private userService: UserService,
              private localStorageService: LocalStorageService,
              private mapsAPILoader: MapsAPILoader,
              private ngZone: NgZone,
              private appService: AppService) {
    this.userData = localStorageService.get('userData');
    this.timeOpts.placeholder = 'Chọn giờ';
    this.datePlaceholderText = 'Chọn ngày';
    this.startDateOpts.placeholder = this.datePlaceholderText;
    this.endDateOpts.placeholder = this.datePlaceholderText;
  }

  ngOnInit() {
    this.loadTickets();
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

  loadTickets() {
    this.tickets = null;
    const parsedUrl = this.router.parseUrl(this.router.url);
    const providerId = +parsedUrl.root.children.primary.segments[1].path;
    this.subscription = this.providerService.getTickets(providerId).subscribe(
      res => {
        let userIds = [];
        if (res.success) {
          this.tickets = res.data.records;
          _.forEach(this.tickets, function (ticket) {
            userIds.push(parseInt(ticket['user_id'], 10));
          });
          userIds = _.uniq(userIds);
          for (const uId of userIds) {
            this.userService.getUser(uId).subscribe(uRes => {
              if (uRes.success) {
                this.userDatas.push({
                  id: uRes.data.id,
                  avatar: uRes.data.avatar,
                  fullname: uRes.data.fullname,
                  email: uRes.data.email,
                  phone: uRes.data.phone
                });
              }
            });
          }
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  getUserById(id) {
    return _.find(this.userDatas, {'id': id});
  }

  handleDateFromChange(dateFrom) {
    this.ticketData.startDate = dateFrom;
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
      this.ticketData.endTime = null;
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
    this.ticketData.status = e.value;
  }

  select2Changed(e) {
    this.ticketData.transportId = parseInt(e.value, 10);
  }

  onKeydownArrival() {
    $('.blur-message-arrival').addClass('hidden').text('');
  }

  onBlurArrival() {
    if (this.ticketData.departureAddress.trim() === '' && !$('.submit-message-arrival').is(':visible')) {
      $('.blur-message-arrival').text('Vui lòng chọn điểm khởi hành').removeClass('hidden');
    }
    if (this.ticketData.departureAddress.trim() !== '' && this.ticketData.departureId === '') {
      $('.blur-message-arrival').text('Điểm khởi hành chưa chính xác').removeClass('hidden');
    }
  }

  onKeydownDeparture() {
    $('.blur-message-departure').addClass('hidden').text('');
  }

  onBlurDeparture() {
    if (this.ticketData.destinationAddress.trim() === '' && !$('.submit-message-departure').is(':visible')) {
      $('.blur-message-departure').text('Vui lòng chọn điểm đến').removeClass('hidden');
    }
    if (this.ticketData.destinationAddress.trim() !== '' && this.ticketData.destinationId === '') {
      $('.blur-message-departure').text('Điểm đến chưa chính xác').removeClass('hidden');
    }
  }

  openTicketModal(ticketItem) {
    const self = this;
    self.ticketData = {
      departureAddress: ticketItem.departureAddress,
      departureId: ticketItem.departureId,
      departureName: ticketItem.departureName,
      destinationAddress: ticketItem.destinationAddress,
      destinationId: ticketItem.destinationId,
      destinationName: ticketItem.destinationName,
      startDate: moment(ticketItem.arrival_datetime, 'YYYY-MM-DD HH:mm').toDate(),
      startTime: moment(ticketItem.arrival_datetime, 'YYYY-MM-DD HH:mm').toDate(),
      endDate: moment(ticketItem.departure_datetime, 'YYYY-MM-DD HH:mm').toDate(),
      endTime: moment(ticketItem.departure_datetime, 'YYYY-MM-DD HH:mm').toDate(),
      transportId: ticketItem.transport_id,
      description: ticketItem.description,
      status: ticketItem.status,
      price: ticketItem.price,
      withDriver: ticketItem.with_driver
    };
    $('#ticket-' + ticketItem.id + '-modal').modal('show');

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
          self.ticketData.departureId = place.place_id;
          self.ticketData.departureAddress = place.formatted_address;
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
          self.ticketData.destinationId = place.place_id;
          self.ticketData.destinationAddress = place.formatted_address;
          $('.blur-message-departure').addClass('hidden').text('');
        });
      });
    });
  }

  cancelUpdateTicket(id) {
    $('#ticket-' + id + '-modal').modal('hide');
  }

  updateTicket(id, event) {
    const self = this;
    $(event.target).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
    event.target.setAttribute('disabled', 'disabled');
    const startDate = self.ticketData.startDate;
    const endDate = self.ticketData.endDate;
    const startTime = self.ticketData.startTime;
    const endTime = self.ticketData.endTime;
    const arrivalDatetime = moment(startDate).format('YYYY-MM-DD') + ' ' + moment(startTime).format('HH:mm');
    let departureDatetime;
    if (self.ticketData.endDate) {
      departureDatetime = moment(endDate).format('YYYY-MM-DD') + ' ' + moment(endTime).format('HH:mm');
    } else {
      departureDatetime = null;
    }
    this.appService.updateTicket(id, {
      departureId: self.ticketData.departureId,
      departureName: self.ticketData.departureName,
      destinationId: self.ticketData.destinationId,
      destinationName: self.ticketData.destinationName,
      arrival_datetime: arrivalDatetime,
      departure_datetime: departureDatetime,
      transport_id: self.ticketData.transportId,
      description: self.ticketData.description,
      status: self.ticketData.status,
      price: self.ticketData.price,
      with_driver: self.ticketData.withDriver
    }).subscribe(
      res => {
        if (res.success) {
          window.swal({
            title: 'Thông báo',
            text: 'Cập nhật vé đã đặt thành công',
            padding: 0,
            customClass: 'paap-swal',
            allowOutsideClick: false,
            showCloseButton: false
          }).then(function () {
            self.loadTickets();
            $('#ticket-' + id + '-modal').modal('hide');
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

  ngOnDestroy() {
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }

}

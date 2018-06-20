import {AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {Router} from '@angular/router';
import {LocalStorageService} from 'angular-2-local-storage';
import {AppService} from '../../../services/app.service';
import {UserService} from '../../../services/user.service';
import {ProviderService} from '../../../services/provider.service';
import {FormControl} from '@angular/forms';
import {} from '@types/googlemaps';
import {MapsAPILoader} from '@agm/core';
import * as moment from 'moment';

declare let $, window, google;

@Component({
  templateUrl: './profile.booked.component.html'
})
export class ProfileBookedComponent implements OnInit, AfterViewInit, OnDestroy {

  subscription: Subscription;
  listTickets: Array<any>;
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
  page = 1;
  page2 = 1;
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
  reviewData = {
    content: ''
  };

  searchControl: FormControl;
  @ViewChild('search')
  public searchElementRef: ElementRef;

  constructor(private router: Router,
              private userService: UserService,
              private localStorageService: LocalStorageService,
              private providerService: ProviderService,
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

  ngAfterViewInit() {
    $(document).on('mouseover', '.review-modal .review-rating i', function () {
      $(this).addClass('active');
      $(this).prevAll().addClass('active');
      $(this).nextAll().removeClass('active');
    });
    $(document).on({
      mouseover: function () {
        $(this).addClass('on-hover');
        $(this).removeClass('on-mouseleave');
        if ($(this).hasClass('on-mouseleave')) {
          $(this).removeClass('selected');
        }
      },
      mouseleave: function () {
        $(this).removeClass('on-hover');
        $(this).addClass('on-mouseleave');
        if (!$(this).hasClass('selected')) {
          $('.post-review .review-rating i').removeClass('active');
        }
        $('.post-review .review-rating i:first-child').addClass('active');
      }
    }, '.review-modal .review-rating');
    $(document).on('click', '.review-modal .review-rating', function () {
      $(this).addClass('selected');
    });
  }

  loadTickets() {
    this.listTickets = null;
    this.subscription = this.userService.tickets().subscribe(
      res => {
        if (res.success) {
          this.listTickets = res.data.records;
        }
      },
      err => {
        console.log(err);
      }
    );
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

  select2Changed(e) {
    this.ticketData.transportId = parseInt(e.value, 10);
  }

  select2StatusChanged(e) {
    this.ticketData.status = e.value;
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
      departureAddress: self.ticketData.departureAddress,
      departureId: self.ticketData.departureId,
      departureName: self.ticketData.departureName,
      destinationAddress: self.ticketData.destinationAddress,
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
            if (self.ticketData.status === 'InActive') {
              setTimeout(() => {
                $('.review-modal').modal('show');
              }, 200);
            }
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

  postReview(event, providerId) {
    const self = this;
    const reviewRating = $('.review-modal .review-rating .active').length;
    $(event.target).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
    event.target.setAttribute('disabled', 'disabled');
    self.providerService.createReview(providerId, {
      content: self.reviewData.content,
      parent_id: 0,
      departureId: self.ticketData.departureId,
      destinationId: self.ticketData.destinationId,
      transport_id: self.ticketData.transportId,
      rating: reviewRating
    }).subscribe(
      res => {
        if (res.success) {
          window.swal({
            title: 'Thông báo',
            text: 'Đánh giá nhà xe thành công',
            padding: 0,
            customClass: 'paap-swal',
            allowOutsideClick: false,
            showCloseButton: false
          }).then(function () {
            $(event.target).find('.fa-spinner').remove();
            $(event.target).removeAttr('disabled');
            window.location.reload(true);
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
    this.subscription.unsubscribe();
  }

}

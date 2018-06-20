import {Component, OnInit, OnDestroy, ElementRef, ViewChild, NgZone} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import {PaapModel} from '../../models/paap-model';
import {UserModel} from '../../models/user-model';
import {Title} from '@angular/platform-browser';
import {AppService} from '../../services/app.service';
import {PaapService} from '../../services/paap.service';
import {ProviderModel} from '../../models/provider-model';
import {UserService} from '../../services/user.service';
import {LocalStorageService} from 'angular-2-local-storage';
import {AngularFireDatabase} from 'angularfire2/database';
import {FormControl} from '@angular/forms';
import {} from '@types/googlemaps';
import {MapsAPILoader} from '@agm/core';
import * as moment from 'moment';
import * as _ from 'lodash';

declare let $, window, google;

@Component({
  templateUrl: './details.component.html'
})
export class DetailsComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  isLogin = false;
  id: number;
  paap: PaapModel;
  user: UserModel;
  listSimilarPaaps: Array<PaapModel> = [];
  listProviderSuggestions: Array<ProviderModel> = [];
  listProviderSuggestions2: Array<ProviderModel> = [];
  visibleReadmore = true;
  visibleReadmore2 = true;
  visibleReadmore3 = true;
  page = 0;
  page2 = 0;
  page3 = 0;
  isOwner = false;
  steps = {
    step1: true,
    step2: false,
    step3: false
  };
  bookData = {
    providerId: 0,
    providerName: '',
    couponCode: '',
    withDriver: false
  };
  userData;
  isBooked = false;
  chatContent = '';
  itemsChat: Array<any> = [];
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
  providerFilterName = '';
  providerFilterSubmit = false;

  searchControl: FormControl;
  @ViewChild('search')
  public searchElementRef: ElementRef;

  constructor(private title: Title,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private localStorageService: LocalStorageService,
              private appService: AppService,
              private paapService: PaapService,
              private userService: UserService,
              private mapsAPILoader: MapsAPILoader,
              private ngZone: NgZone,
              private afdb: AngularFireDatabase) {
    const self = this;
    self.subscription = activatedRoute.params.subscribe(param => {
      self.id = param['id'];
      title.setTitle('PAAP | Chi tiết');
    });
    self.timeOpts.placeholder = 'Chọn giờ';
    self.datePlaceholderText = 'Chọn ngày';
    self.startDateOpts.placeholder = self.datePlaceholderText;
    self.endDateOpts.placeholder = self.datePlaceholderText;
    if (localStorageService.get('userData')) {
      self.isLogin = true;
      self.userData = localStorageService.get('userData');
    }
  }

  ngOnInit() {
    const self = this;
    self.loadPaapDetails();
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
    self.statusSelect2Options = {
      minimumResultsForSearch: -1
    };
    self.loadPaaps();
    self.loadSuggestions();
    self.loadSuggestions2();
    self.appService.filterNameSuggestion.subscribe((res: string) => {
      this.providerFilterName = res;
      this.providerFilterSubmit = true;
      self.loadSuggestions2();
    });
  }

  loadPaapDetails() {
    const self = this;
    self.paapService.getPaap(self.id).subscribe(
      res => {
        if (res.success) {
          if (res.data.status === 'InActive') {
            window.swal({
              title: 'Thông báo',
              text: 'PAAP này đã đóng. Vui lòng chọn PAAP khác.',
              padding: 0,
              customClass: 'paap-swal',
              allowOutsideClick: false,
              showCloseButton: false
            }).then(() => {
              self.router.navigate(['/']);
            });
          }
          self.paap = res.data;
          self.isBooked = self.paap.booked;
          if (self.userData !== undefined && self.paap.user_id === self.userData.id) {
            self.isOwner = true;
          }
          if (self.isLogin && !self.isOwner) {
            self.appService.getChannels(res.data.user_id).subscribe(res2 => {
              if (res2.success) {
                self.afdb.list('/chat/msgs/' + res2.data.channel).valueChanges().subscribe((res3: any) => {
                  if (res3.sender !== self.userData.id) {
                    self.itemsChat = _.clone(res3);
                    $('.chat-contents').perfectScrollbar('update');
                    setTimeout(() => {
                      $('.chat-contents').scrollTop(99999);
                    }, 100);
                  }
                });
              }
            });
          }
          self.userService.getUser(res.data.user_id).subscribe(
            res2 => {
              if (res2.success) {
                self.user = res2.data;
              }
            },
            err2 => {
              console.log(err2);
            }
          );
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  loadPaaps(e?) {
    const self = this;
    $('.list-paaps').addClass('is-loading');
    self.paapService.getSimilarList(self.id, {limit: 4, page: ++self.page}).subscribe(
      res => {
        if (res.success) {
          if (res.data.paging.pages <= self.page) {
            self.visibleReadmore = false;
          }
          self.listSimilarPaaps = self.listSimilarPaaps.concat(res.data.records);
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

  loadSuggestions(e?) {
    const self = this;
    $('.list-provider-suggestions').addClass('is-loading');
    self.paapService.getProviderSuggestionsList(self.id, {limit: 4, page: ++self.page2}).subscribe(
      res => {
        if (res.success) {
          if (res.data.paging.pages <= self.page2) {
            self.visibleReadmore2 = false;
          }
          self.listProviderSuggestions = self.listProviderSuggestions.concat(res.data.records);
        }
      },
      err => {
        console.log(err);
      },
      () => {
        $('.list-provider-suggestions').removeClass('is-loading');
        if (e !== undefined) {
          $('html, body').animate({scrollTop: e.target.offsetTop}, 800);
        }
      }
    );
  }

  loadSuggestions2(e?) {
    const self = this;
    let suggestionPage;
    if (this.providerFilterSubmit) {
      suggestionPage = 0;
      self.page3 = 1;
    } else {
      suggestionPage = ++self.page3;
    }
    $('#select-providers-tab').addClass('is-loading');
    self.paapService.getProviderSuggestionsList(self.id, {
      name: this.providerFilterName,
      limit: 6,
      page: suggestionPage
    }).subscribe(
      res => {
        if (res.success) {
          const records = res.data['records'];
          if (res.data['paging'].pages > self.page3) {
            self.visibleReadmore3 = true;
          } else {
            self.visibleReadmore3 = false;
          }
          self.listProviderSuggestions2 = this.providerFilterSubmit ? records : self.listProviderSuggestions2.concat(records);
        }
      },
      err => {
        console.log(err);
      },
      () => {
        $('#select-providers-tab').removeClass('is-loading');
        if (e !== undefined) {
          $('.modal-open .modal').animate({scrollTop: e.target.offsetTop}, 800);
        }
        this.providerFilterSubmit = false;
      }
    );
  }

  openBookModal() {
    this.steps.step2 = false;
    $('.book-tabs li:eq(1) span').text(2);
    $('.book-tabs li:eq(2) span').text(3);
    $('#confirm-info-tab .prev-btn').show();
    $('.book-modal li:eq(0)').show();
    $('.book-modal').modal('show');
    setTimeout(() => {
      $('.book-modal li:eq(0) a').tab('show');
    }, 100);
  }

  openBookModal2(provider) {
    this.steps.step2 = true;
    this.bookData.providerId = provider.id;
    this.bookData.providerName = provider.name;
    $('.book-tabs li:eq(1) span').text(1);
    $('.book-tabs li:eq(2) span').text(2);
    $('#confirm-info-tab .prev-btn').hide();
    $('.book-modal li:eq(0)').hide();
    $('.book-modal').modal('show');
    setTimeout(() => {
      $('.book-modal li:eq(1) a').tab('show');
    }, 100);
  }

  goStep1() {
    setTimeout(() => {
      $('.book-modal li:eq(0) a').tab('show');
    }, 100);
  }

  goStep2(provider) {
    this.bookData.providerId = provider.id;
    this.bookData.providerName = provider.name;
    this.steps.step2 = true;
    setTimeout(() => {
      $('.book-modal li:eq(1) a').tab('show');
    }, 100);
  }

  goStep3() {
    $('#confirm-info-tab').addClass('is-loading');
    const ticketData = {
      paap_id: this.id,
      provider_id: this.bookData.providerId,
      discount_code: this.bookData.couponCode.trim(),
      with_driver: this.bookData.withDriver
    };
    this.appService.createTicket(ticketData).subscribe(
      res => {
        if (res.success) {
          this.steps.step3 = true;
          this.isBooked = true;
          setTimeout(() => {
            $('.book-modal li:eq(2) a').tab('show');
          }, 100);
        }
      },
      err => {
        console.log(err);
      },
      () => {
        $('#confirm-info-tab').removeClass('is-loading');
      }
    );
  }

  goHomepage() {
    $('.book-modal').modal('hide');
    this.router.navigate(['/']);
  }

  submitChatMessage(e?) {
    const self = this;
    if (e.type === 'click' || e.keyCode === 13) {
      if (self.chatContent.trim() !== '') {
        self.appService.sendMessage(self.paap.user_id, self.chatContent).subscribe(res => {
          console.log(res);
        });
        self.itemsChat.push({
          content: self.chatContent,
          time: moment().unix(),
          receiver: self.paap.user_id,
          sender: self.userData.id
        });
        self.chatContent = '';
        $('.chat-contents').perfectScrollbar('update');
        setTimeout(() => {
          $('.chat-contents').scrollTop(99999);
        }, 100);
      }
    }
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
    const $arrivalMessage = $('.blur-message-arrival');
    if (this.paapData.departureAddress.trim() === '' && !$('.submit-message-arrival').is(':visible')) {
      $arrivalMessage.text('Vui lòng chọn điểm khởi hành').removeClass('hidden');
    }
    if (this.paapData.departureAddress.trim() !== '' && this.paapData.departureId === '') {
      $arrivalMessage.text('Điểm khởi hành chưa chính xác').removeClass('hidden');
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
    self.paapService.update(id, new PaapModel({
      departureId: self.paapData.departureId,
      departureName: self.paapData.departureName,
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
            $('.paap-modal').modal('hide');
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

  cancelUpdatePaap(id) {
    $('#paap-' + id + '-modal').modal('hide');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}

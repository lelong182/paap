import {AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {Router} from '@angular/router';
import {ProviderService} from '../../../services/provider.service';
import {AppService} from '../../../services/app.service';
import {LocalStorageService} from 'angular-2-local-storage';
import {FormControl} from '@angular/forms';
import {} from '@types/googlemaps';
import {MapsAPILoader} from '@agm/core';

declare let $, window, google;

@Component({
  templateUrl: './provider-details.review.component.html'
})
export class ProviderDetailsReviewComponent implements OnInit, AfterViewInit, OnDestroy {

  isLogin = false;
  providerId;
  subscription: Subscription;
  reviews;
  listTransport: any = [];
  @ViewChild('arrivalInput') arrivalInput: ElementRef;
  @ViewChild('departureInput') departureInput: ElementRef;
  page = 1;
  reviewData = {
    departureAddress: '',
    departureId: '',
    destinationAddress: '',
    destinationId: '',
    transportId: 0,
    content: '',
    rating: 0
  };

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
    }
  }

  ngOnInit() {
    const self = this;
    const parsedUrl = self.router.parseUrl(self.router.url);
    self.providerId = parseInt(parsedUrl.root.children.primary.segments[1].path, 10);
    self.loadReviews();
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
          self.reviewData.departureId = place.place_id;
          self.reviewData.departureAddress = place.formatted_address;
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
          self.reviewData.destinationId = place.place_id;
          self.reviewData.destinationAddress = place.formatted_address;
          $('.blur-message-departure').addClass('hidden').text('');
        });
      });
    });
  }

  loadReviews() {
    const self = this;
    self.subscription = self.providerService.getReviews(self.providerId).subscribe(
      res => {
        if (res.success) {
          self.reviews = res.data.records;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  select2Changed(e) {
    this.reviewData.transportId = parseInt(e.value, 10);
  }

  onKeydownArrival() {
    $('.blur-message-arrival').addClass('hidden').text('');
  }

  onBlurArrival() {
    if (this.reviewData.departureAddress.trim() === '' && !$('.submit-message-arrival').is(':visible')) {
      $('.blur-message-arrival').text('Vui lòng chọn điểm khởi hành').removeClass('hidden');
    }
    if (this.reviewData.departureAddress.trim() !== '' && this.reviewData.departureId === '') {
      $('.blur-message-arrival').text('Điểm khởi hành chưa chính xác').removeClass('hidden');
    }
  }

  onKeydownDeparture() {
    $('.blur-message-departure').addClass('hidden').text('');
  }

  onBlurDeparture() {
    if (this.reviewData.destinationAddress.trim() === '' && !$('.submit-message-departure').is(':visible')) {
      $('.blur-message-departure').text('Vui lòng chọn điểm đến').removeClass('hidden');
    }
    if (this.reviewData.destinationAddress.trim() !== '' && this.reviewData.destinationId === '') {
      $('.blur-message-departure').text('Điểm đến chưa chính xác').removeClass('hidden');
    }
  }

  ngAfterViewInit() {
    $(document).on('mouseover', '.post-review .review-rating i', function () {
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
    }, '.post-review .review-rating');
    $(document).on('click', '.post-review .review-rating', function () {
      $(this).addClass('selected');
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

  postReview(event, postForm) {
    const self = this;
    self.reviewData.rating = $('.post-review .review-rating .active').length;
    $(event.target).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
    event.target.setAttribute('disabled', 'disabled');
    this.providerService.createReview(self.providerId, {
      content: self.reviewData.content,
      parent_id: 0,
      departureId: self.reviewData.departureId,
      destinationId: self.reviewData.destinationId,
      transport_id: self.reviewData.transportId,
      rating: self.reviewData.rating
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
            if (postForm.valid) {
              $('.post-review .review-rating i').removeClass('active');
              $('.post-review .review-rating i:first-child').addClass('active');
              self.reviewData = {
                departureAddress: '',
                departureId: '',
                destinationAddress: '',
                destinationId: '',
                transportId: 0,
                content: '',
                rating: 0
              };
              self.listTransport = [];
              setTimeout(function () {
                self.listTransport = self.localStorageService.get('listTransport');
              }, 0);
              postForm.reset();
            }
            self.loadReviews();
            $(event.target).find('.fa-spinner').remove();
            $(event.target).removeAttr('disabled');
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

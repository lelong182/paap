import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs/Subscription";
import {UserService} from "../../../services/user.service";

@Component({
  templateUrl: './profile.review.component.html'
})
export class ProfileReviewComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  listReviews: Array<any>;
  listProviders;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.subscription = this.userService.reviews().subscribe(
      res => {
        if (res.success) {
          this.listReviews = res.data.records;
        }
      },
      err => {
        console.log(err);
      }
    );
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}

import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SearchComponent} from './components/search/search.component';
import {HomeComponent} from './components/home/home.component';
import {DetailsComponent} from './components/details/details.component';
import {CreateComponent} from './components/create/create.component';
import {ProvidersComponent} from './components/providers/providers.component';
import {SearchProviderComponent} from './components/search-provider/search-provider.component';
import {LoginComponent} from './components/login/login.component';
import {ProfileComponent} from './components/profile/profile.component';
import {CreateProviderComponent} from './components/create-provider/create-provider.component';
import {AuthGuardService} from './services/auth-guard.service';
import {AdminAuthGuardService} from './services/admin-auth-guard.service';
import {ProviderDetailsComponent} from './components/provider-details/provider-details.component';
import {ProviderDetailsInfoComponent} from './components/provider-details/info/provider-details.info.component';
import {ProviderDetailsReviewComponent} from './components/provider-details/review/provider-details.review.component';
import {ProviderDetailsAreaComponent} from './components/provider-details/area/provider-details.area.component';
import {ProviderDetailsBookedComponent} from './components/provider-details/booked/provider-details.booked.component';
import {ProfileInfoComponent} from './components/profile/info/profile.info.component';
import {ProfileBookedComponent} from './components/profile/booked/profile.booked.component';
import {ProfileCreatedComponent} from './components/profile/created/profile.created.component';
import {ProfileReviewComponent} from './components/profile/review/profile.review.component';
import {InboxComponent} from './components/inbox/inbox.component';
import {MapActiveComponent} from './components/map-active/map-active.component';
import {ForgotPasswordComponent} from './components/forgot-password/forgot-password.component';
import {CheckEmailResetPasswordComponent} from './components/check-email-reset-password/check-email-reset-password.component';
import {AdmintrationComponent} from './components/admintration/admintration.component';
import {CreateTransportComponent} from './components/admintration/create-transport/create-transport.component';
import {UpdateContentComponent} from './components/admintration/update-content/update-content.component';
import {AboutComponent} from './components/about/about.component';

const routes: Routes = [
  {
    path: 'provider-details/:id',
    component: ProviderDetailsComponent,
    children: [
      {
        path: '',
        component: ProviderDetailsInfoComponent,
        outlet: 'provider'
      },
      {
        path: 'review',
        component: ProviderDetailsReviewComponent,
        outlet: 'provider'
      },
      {
        path: 'area',
        component: ProviderDetailsAreaComponent,
        outlet: 'provider'
      },
      {
        path: 'booked',
        // canActivate: [AdminAuthGuardService],
        component: ProviderDetailsBookedComponent,
        outlet: 'provider'
      }
    ]
  }, {
    path: 'create-provider',
    canActivate: [AdminAuthGuardService],
    component: CreateProviderComponent
  }, {
    path: 'create-provider/:id',
    canActivate: [AuthGuardService],
    component: CreateProviderComponent
  }, {
    path: 'profile',
    canActivate: [AuthGuardService],
    component: ProfileComponent,
    children: [
      {
        path: '',
        component: ProfileInfoComponent,
        outlet: 'profile'
      },
      {
        path: 'booked',
        component: ProfileBookedComponent,
        outlet: 'profile'
      },
      {
        path: 'created',
        component: ProfileCreatedComponent,
        outlet: 'profile'
      },
      {
        path: 'review',
        component: ProfileReviewComponent,
        outlet: 'profile'
      }
    ]
  }, {
    path: 'inbox/:id',
    component: InboxComponent
  }, {
    path: 'details/:id',
    component: DetailsComponent
  }, {
    path: 'create',
    canActivate: [AuthGuardService],
    component: CreateComponent
  }, {
    path: 'search-provider',
    component: SearchProviderComponent
  }, {
    path: 'providers',
    component: ProvidersComponent
  }, {
    path: 'login',
    component: LoginComponent
  }, {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  }, {
    path: 'search',
    component: SearchComponent
  }, {
    path: 'map-active/:ids',
    component: MapActiveComponent
  }, {
    path: 'about',
    component: AboutComponent
  }, {
    path: '',
    component: HomeComponent
  }, {
    path: 'check-email-reset-password',
    component: CheckEmailResetPasswordComponent
  }, {
    path: 'administration',
    canActivate: [AdminAuthGuardService],
    component: AdmintrationComponent
  }, {
    path: 'create-transport',
    canActivate: [AdminAuthGuardService],
    component: CreateTransportComponent
  }, {
    path: 'create-transport/:id',
    canActivate: [AdminAuthGuardService],
    component: CreateTransportComponent
  }, {
    path: 'update-content',
    canActivate: [AdminAuthGuardService],
    component: UpdateContentComponent
  }, {
    path: 'update-content/:type',
    canActivate: [AdminAuthGuardService],
    component: UpdateContentComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuardService, AdminAuthGuardService]
})

export class AppRoutingModule {
}

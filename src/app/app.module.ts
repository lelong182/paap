import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {HttpClientModule} from '@angular/common/http';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {AppService} from './services/app.service';
import {LocalStorageModule} from 'angular-2-local-storage';
import {Select2Module} from 'ng2-select2';
import {NKDatetimeModule} from 'ng2-datetime/ng2-datetime';
import {TopbarComponent} from './components/topbar/topbar.component';
import {FooterComponent} from './components/footer/footer.component';
import {SloganComponent} from './components/slogan/slogan.component';
import {HeroComponent} from './components/hero/hero.component';
import {HomeComponent} from './components/home/home.component';
import {AboutComponent} from './components/about/about.component';
import {DetailsComponent} from './components/details/details.component';
import {CreateComponent} from './components/create/create.component';
import {ItemComponent} from './components/item/item.component';
import {CustomDatePipe} from './pipes/custom-date.pipe';
import {CustomNumberPipe} from './pipes/custom-number.pipe';
import {DurationPipe} from './pipes/duration.pipe';
import {TimeAgoPipe} from './pipes/timeAgo.pipe';
import {TextLimitPipe} from './pipes/text-limit.pipe';
import {UserInfoPipe} from './pipes/user-info.pipe';
import {TransportNamePipe} from './pipes/transport-name.pipe';
import {UserService} from './services/user.service';
import {TransportService} from './services/transport.service';
import {ProviderService} from './services/provider.service';
import {PaapService} from './services/paap.service';
import {HelperApiService} from './services/helper-api.service';
import {LoginComponent} from './components/login/login.component';
import {EqualValidator} from './validator/equal-validator.directive';
import {SearchComponent} from './components/search/search.component';
import {ProvidersComponent} from './components/providers/providers.component';
import {ProviderItemComponent} from './components/provider-item/provider-item.component';
import {ProfileComponent} from './components/profile/profile.component';
import {SearchProviderComponent} from './components/search-provider/search-provider.component';
import {ProviderHeroComponent} from './components/provider-hero/provider-hero.component';
import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {environment} from '../environments/environment';
import {CreateProviderComponent} from './components/create-provider/create-provider.component';
import {InlineSVGModule} from 'ng-inline-svg';
import {FileUploadModule} from 'ng2-file-upload';
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
import {ProviderFiltersComponent} from './components/provider-filters/provider-filters.component';
import {FroalaEditorModule, FroalaViewModule} from 'angular-froala-wysiwyg';
import {ForgotPasswordComponent} from './components/forgot-password/forgot-password.component';
import {CheckEmailResetPasswordComponent} from './components/check-email-reset-password/check-email-reset-password.component';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {PERFECT_SCROLLBAR_CONFIG} from 'ngx-perfect-scrollbar';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {AdmintrationComponent} from './components/admintration/admintration.component';
import {CreateTransportComponent} from './components/admintration/create-transport/create-transport.component';
import {UpdateContentComponent} from './components/admintration/update-content/update-content.component';
import {AgmCoreModule} from '@agm/core';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelPropagation: true
};

@NgModule({
  declarations: [
    AppComponent,
    TopbarComponent,
    TopbarComponent,
    FooterComponent,
    SloganComponent,
    HeroComponent,
    HomeComponent,
    AboutComponent,
    DetailsComponent,
    CreateComponent,
    ItemComponent,
    CustomDatePipe,
    CustomNumberPipe,
    DurationPipe,
    TimeAgoPipe,
    TextLimitPipe,
    UserInfoPipe,
    TransportNamePipe,
    LoginComponent,
    EqualValidator,
    SearchComponent,
    ProvidersComponent,
    ProviderItemComponent,
    ProfileComponent,
    SearchProviderComponent,
    ProviderHeroComponent,
    CreateProviderComponent,
    ProviderDetailsComponent,
    ProviderDetailsInfoComponent,
    ProviderDetailsReviewComponent,
    ProviderDetailsAreaComponent,
    ProviderDetailsBookedComponent,
    ProfileInfoComponent,
    ProfileBookedComponent,
    ProfileCreatedComponent,
    ProfileReviewComponent,
    InboxComponent,
    MapActiveComponent,
    ProviderFiltersComponent,
    ForgotPasswordComponent,
    CheckEmailResetPasswordComponent,
    AdmintrationComponent,
    CreateTransportComponent,
    UpdateContentComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    AppRoutingModule,
    LocalStorageModule.withConfig({
      prefix: 'paap',
      storageType: 'localStorage'
    }),
    Select2Module,
    NKDatetimeModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    InlineSVGModule,
    FileUploadModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    PerfectScrollbarModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD8vIefBmxHoIEYZ99U1gBUKxV5D5t3wiA',
      libraries: ['places'],
      region: 'VN',
      language: 'vi'
    })
  ],
  providers: [
    AppService,
    UserService,
    TransportService,
    ProviderService,
    PaapService,
    HelperApiService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}

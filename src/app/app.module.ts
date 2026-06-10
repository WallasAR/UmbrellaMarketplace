import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { ProductCardComponent } from './components/product-card/product-card.component'
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { ProductCardSkeletonComponent } from './components/product-card-skeleton/product-card-skeleton.component';
import { InputComponent } from './components/input/input.component';
import { ButtonComponent } from './components/button/button.component';
import { ProductDetailsSkeletonComponent } from './components/product-details-skeleton/product-details-skeleton.component';
import { CartComponent } from './pages/cart/cart.component';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { AuthComponent } from './pages/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ImgFallbackDirective } from './directives/img-fallback.directive';
import { AboutComponent } from './pages/about/about.component';
import { FaqsComponent } from './pages/faqs/faqs.component';
import { CategoryComponent } from './pages/category/category.component';
import { CheckoutSuccessComponent } from './pages/checkout-success/checkout-success.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AdminComponent } from './pages/admin/admin.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ToastComponent } from './components/toast/toast.component';
import { PrescriptionUploadComponent } from './components/prescription-upload/prescription-upload.component';
import { ProductFiltersComponent } from './components/product-filters/product-filters.component';
import { ProductReviewsComponent } from './components/product-reviews/product-reviews.component';
import { SubscriptionsComponent } from './pages/subscriptions/subscriptions.component';
import { MetricsBarChartComponent } from './components/metrics-bar-chart/metrics-bar-chart.component';
import { PharmacyPanelComponent } from './pages/pharmacy-panel/pharmacy-panel.component';
import { PharmacyRegisterComponent } from './pages/pharmacy-register/pharmacy-register.component';
import { NearbyPharmaciesComponent } from './pages/nearby-pharmacies/nearby-pharmacies.component';
import { CheckoutCancelComponent } from './pages/checkout-cancel/checkout-cancel.component';
import { CopilotWidgetComponent } from './components/copilot-widget/copilot-widget.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    FooterComponent,
    CarouselComponent,
    ProductCardComponent,
    ProductListComponent,
    ProductDetailsComponent,
    ProductCardSkeletonComponent,
    InputComponent,
    ButtonComponent,
    ProductDetailsSkeletonComponent,
    CartComponent,
    AuthComponent,
    ImgFallbackDirective,
    AboutComponent,
    FaqsComponent,
    CategoryComponent,
    CheckoutSuccessComponent,
    CheckoutComponent,
    OrdersComponent,
    ProfileComponent,
    AdminComponent,
    NotFoundComponent,
    ToastComponent,
    PrescriptionUploadComponent,
    ProductFiltersComponent,
    ProductReviewsComponent,
    SubscriptionsComponent,
    PharmacyPanelComponent,
    PharmacyRegisterComponent,
    CheckoutCancelComponent,
    MetricsBarChartComponent,
    CopilotWidgetComponent,
    NearbyPharmaciesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

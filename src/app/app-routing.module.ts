import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { HomeComponent } from './pages/home/home.component';
import { CartComponent } from './pages/cart/cart.component';
import { AuthComponent } from './pages/login/login.component';
import { AboutComponent } from './pages/about/about.component';
import { FaqsComponent } from './pages/faqs/faqs.component';
import { CategoryComponent } from './pages/category/category.component';
import { CheckoutSuccessComponent } from './pages/checkout-success/checkout-success.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AdminComponent } from './pages/admin/admin.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { SubscriptionsComponent } from './pages/subscriptions/subscriptions.component';
import { PharmacyPanelComponent } from './pages/pharmacy-panel/pharmacy-panel.component';
import { PharmacyRegisterComponent } from './pages/pharmacy-register/pharmacy-register.component';
import { CheckoutCancelComponent } from './pages/checkout-cancel/checkout-cancel.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { pharmacyGuard } from './guards/pharmacy.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'product/:id', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'subscriptions', component: SubscriptionsComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard] },
  { path: 'pharmacy', component: PharmacyPanelComponent, canActivate: [authGuard, pharmacyGuard] },
  { path: 'pharmacy/register', component: PharmacyRegisterComponent, canActivate: [authGuard] },
  { path: 'auth', component: AuthComponent },
  { path: 'about', component: AboutComponent },
  { path: 'faqs', component: FaqsComponent },
  { path: 'category', component: CategoryComponent },
  { path: 'checkout/success', component: CheckoutSuccessComponent },
  { path: 'checkout/cancel', component: CheckoutCancelComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

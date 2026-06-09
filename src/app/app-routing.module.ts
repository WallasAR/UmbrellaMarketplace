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

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'product/:id',
    component: ProductDetailsComponent
  },
  {
    path: 'cart',
    component: CartComponent
  },
  {
    path: 'auth',
    component: AuthComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'faqs',
    component: FaqsComponent
  },
  {
    path: 'category',
    component: CategoryComponent
  },
  {
    path: 'checkout/success',
    component: CheckoutSuccessComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

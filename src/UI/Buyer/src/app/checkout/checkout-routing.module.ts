// core services
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// checkout routes
import { CheckoutComponent } from '@app-buyer/checkout/containers/checkout/checkout.component';
import { CartComponent } from '@app-buyer/checkout/containers/cart/cart.component';
import { OrderConfirmationComponent } from '@app-buyer/checkout/containers/order-confirmation/order-confirmation.component';

const routes: Routes = [
  { path: 'checkout', component: CheckoutComponent },
  { path: 'cart', component: CartComponent },
  {
    path: 'order-confirmation/:orderID',
    component: OrderConfirmationComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckoutRoutingModule {}

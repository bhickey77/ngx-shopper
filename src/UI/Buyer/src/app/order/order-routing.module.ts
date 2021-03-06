import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderHistoryComponent } from '@app-buyer/order/containers/order-history/order-history.component';
import { OrderDetailComponent } from '@app-buyer/order/containers/order-detail/order-detail.component';
import { OrderComponent } from '@app-buyer/order/containers/order/order.component';
import { OrderResolve } from '@app-buyer/order/order.resolve';
import { OrderShipmentsComponent } from '@app-buyer/order/containers/order-shipments/order-shipments.component';
import { ShipmentsResolve } from '@app-buyer/order/shipments.resolve';
import { OrderAprovalComponent } from '@app-buyer/order/containers/order-approval/order-approval.component';
import { OrderApprovalDetailsComponent } from '@app-buyer/order/containers/order-approval-details/order-approval-details.component';

const routes: Routes = [
  { path: '', component: OrderHistoryComponent },
  { path: 'approval', component: OrderAprovalComponent },
  {
    path: 'approval/:orderID',
    component: OrderApprovalDetailsComponent,
    resolve: { orderResolve: OrderResolve },
  },
  {
    path: ':orderID',
    component: OrderComponent,
    resolve: { orderResolve: OrderResolve },
    children: [
      { path: '', component: OrderDetailComponent },
      {
        path: 'shipments',
        component: OrderShipmentsComponent,
        resolve: { shipmentsResolve: ShipmentsResolve },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}

import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import {
  Order,
  ListLineItem,
  ListPromotion,
  OcOrderService,
  ListPayment,
  OrderApproval,
} from '@ordercloud/angular-sdk';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AppPaymentService } from '@app-buyer/shared/services/app-payment-service/app-payment.service';
import { uniqBy as _uniqBy } from 'lodash';

@Component({
  selector: 'order-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  order$: Observable<Order>;
  lineItems$: Observable<ListLineItem>;
  promotions$: Observable<ListPromotion>;
  lineItems: ListLineItem;
  payments$: Observable<ListPayment>;
  approvals$: Observable<OrderApproval[]>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private ocOrderService: OcOrderService,
    private appPaymentService: AppPaymentService
  ) {}

  ngOnInit() {
    this.order$ = this.activatedRoute.parent.data.pipe(
      map(({ orderResolve }) => orderResolve.order)
    );
    this.lineItems$ = this.activatedRoute.parent.data.pipe(
      map(({ orderResolve }) => orderResolve.lineItems)
    );
    this.promotions$ = this.getPromotions();
    this.payments$ = this.getPayments();
    this.approvals$ = this.getApprovals();
  }

  private getPromotions() {
    return this.activatedRoute.paramMap.pipe(
      flatMap((params: ParamMap) =>
        this.ocOrderService.ListPromotions('outgoing', params.get('orderID'))
      )
    );
  }

  getPayments(): Observable<ListPayment> {
    return this.activatedRoute.paramMap.pipe(
      flatMap((params: ParamMap) =>
        this.appPaymentService.getPayments('outgoing', params.get('orderID'))
      )
    );
  }

  getApprovals(): Observable<OrderApproval[]> {
    return this.activatedRoute.paramMap.pipe(
      flatMap((params: ParamMap) =>
        this.ocOrderService.ListApprovals('outgoing', params.get('orderID'))
      ),
      map((list) => {
        list.Items = list.Items.filter((x) => x.Approver);
        return _uniqBy(list.Items, (x) => x.Comments);
      })
    );
  }
}

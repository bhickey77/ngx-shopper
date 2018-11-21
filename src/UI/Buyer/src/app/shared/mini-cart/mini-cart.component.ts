import { Component, OnInit } from '@angular/core';
import { AppStateService } from '../services/app-state/app-state.service';
import { takeWhile } from 'rxjs/operators';
import {
  ListLineItem,
  OcMeService,
  BuyerProduct,
  Order,
  LineItem,
} from '@ordercloud/angular-sdk';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'shared-mini-cart',
  templateUrl: './mini-cart.component.html',
  styleUrls: ['./mini-cart.component.scss'],
})
export class MiniCartComponent implements OnInit {
  alive: boolean;
  lineItems: ListLineItem;
  productsSet = false;
  products: BuyerProduct[];
  currentOrder$: Observable<Order>;

  constructor(
    private appStateService: AppStateService,
    private ocMeService: OcMeService
  ) {}

  ngOnInit() {
    this.alive = true;
    this.currentOrder$ = this.appStateService.orderSubject;
    this.appStateService.lineItemSubject
      .pipe(takeWhile(() => this.alive))
      .subscribe((lis) => {
        this.lineItems = lis;
        if (!this.productsSet) {
          const queue = [];
          lis.Items.forEach((li) =>
            queue.push(this.ocMeService.GetProduct(li.ProductID))
          );
          forkJoin(queue).subscribe((prods) => {
            this.products = prods;
            this.productsSet = true;
          });
        }
      });
  }

  getProduct(li: LineItem): BuyerProduct {
    return this.products.find((x) => x.ID === li.ProductID);
  }
}

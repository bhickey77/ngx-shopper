import { Component, OnInit, Input } from '@angular/core';
import { CheckoutSectionBaseComponent } from '@app-buyer/checkout/components/checkout-section-base/checkout-section-base.component';
import { Observable } from 'rxjs';
import {
  OcMeService,
  ListBuyerAddress,
  OcOrderService,
  Order,
  BuyerAddress,
  ListLineItem,
  Address,
} from '@ordercloud/angular-sdk';
import { AppStateService, ModalService } from '@app-buyer/shared';
import { filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'checkout-address',
  templateUrl: './checkout-address.component.html',
  styleUrls: ['./checkout-address.component.scss'],
})
export class CheckoutAddressComponent extends CheckoutSectionBaseComponent
  implements OnInit {
  @Input() isAnon: boolean;
  @Input() addressType: 'Shipping' | 'Billing';
  existingAddresses: ListBuyerAddress;
  selectedAddress: BuyerAddress;
  order: Order;
  lineItems: ListLineItem;
  resultsPerPage = 8;
  requestOptions: { page?: number; search?: string } = {
    page: undefined,
    search: undefined,
  };
  modalID: string;

  constructor(
    private ocMeService: OcMeService,
    private ocOrderService: OcOrderService,
    private appStateService: AppStateService,
    private modalService: ModalService,
    private toastrService: ToastrService
  ) {
    super();
  }

  ngOnInit() {
    this.modalID = `checkout-select-address-${this.addressType}`;
    this.clearFiltersOnModalClose();
    if (!this.isAnon) {
      this.getSavedAddresses();
    }

    this.setSelectedAddress();
  }

  clearFiltersOnModalClose() {
    this.modalService.onCloseSubject
      .pipe(filter((id) => id === this.modalID))
      .subscribe(() =>
        this.updateRequestOptions({ page: undefined, search: undefined })
      );
  }

  updateRequestOptions(options: { page?: number; search?: string }) {
    this.requestOptions = options;
    this.getSavedAddresses();
  }

  private getSavedAddresses() {
    const filters = {};
    filters[this.addressType] = true;
    this.ocMeService
      .ListAddresses({
        filters,
        ...this.requestOptions,
        pageSize: this.resultsPerPage,
      })
      .subscribe((addressList) => (this.existingAddresses = addressList));
  }

  private setSelectedAddress() {
    this.order = this.appStateService.orderSubject.value;
    this.lineItems = this.appStateService.lineItemSubject.value;

    this.selectedAddress =
      this.addressType === 'Billing'
        ? this.order.BillingAddress
        : this.lineItems.Items[0].ShippingAddress; // shipping address is defined at the line item level
  }

  existingAddressSelected(address: BuyerAddress) {
    this.selectedAddress = address;
    this.modalService.close(this.modalID);
  }

  saveAddress(address: Address, formDirty: boolean) {
    let request = this.setSavedAddress(address);
    if (this.isAnon || formDirty) {
      request = this.setOneTimeAddress(address);
    }
    request.subscribe(
      (order) => {
        if (this.addressType === 'Shipping') {
          this.lineItems.Items[0].ShippingAddress = address;
          this.appStateService.lineItemSubject.next(this.lineItems);
        }
        this.order = order;
        this.appStateService.orderSubject.next(this.order);
        this.continue.emit();
      },
      (ex) => {
        if (ex.error.Errors[0].ErrorCode === 'NotFound') {
          this.toastrService.error(
            'You no longer have access to this saved address. Please enter or select a different one.'
          );
        }
      }
    );
  }

  private setOneTimeAddress(address: BuyerAddress): Observable<Order> {
    return this.ocOrderService[`Set${this.addressType}Address`](
      'outgoing',
      this.order.ID,
      address
    );
  }

  private setSavedAddress(address): Observable<Order> {
    const addressKey = <any>`${this.addressType}AddressID`;
    const partialOrder = {};
    partialOrder[addressKey] = address.ID;
    return this.ocOrderService.Patch('outgoing', this.order.ID, partialOrder);
  }
}

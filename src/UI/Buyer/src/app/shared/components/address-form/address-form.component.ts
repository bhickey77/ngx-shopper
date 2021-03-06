import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// 3rd party
import { BuyerAddress, Address } from '@ordercloud/angular-sdk';
import { AppGeographyService } from '@app-buyer/shared/services/geography/geography.service';
import { AppFormErrorService } from '@app-buyer/shared/services/form-error/form-error.service';

@Component({
  selector: 'shared-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss'],
})
export class AddressFormComponent implements OnInit {
  private _existingAddress: BuyerAddress;
  @Input() btnText: string;
  @Output()
  formSubmitted = new EventEmitter<{ address: Address; formDirty: boolean }>();
  stateOptions: string[];
  countryOptions: { label: string; abbreviation: string }[];
  addressForm: FormGroup;

  constructor(
    private ocGeography: AppGeographyService,
    private formBuilder: FormBuilder,
    private formErrorService: AppFormErrorService
  ) {
    this.stateOptions = this.ocGeography.getStates().map((s) => s.abbreviation);
    this.countryOptions = this.ocGeography.getCountries();
  }

  ngOnInit() {
    this.setForm();
  }

  @Input()
  set existingAddress(address: BuyerAddress) {
    this._existingAddress = address || {};
    this.setForm();
    this.addressForm.markAsPristine();
  }

  setForm() {
    this.addressForm = this.formBuilder.group({
      FirstName: [this._existingAddress.FirstName || '', Validators.required],
      LastName: [this._existingAddress.LastName || '', Validators.required],
      Street1: [this._existingAddress.Street1 || '', Validators.required],
      Street2: [this._existingAddress.Street2 || ''],
      City: [this._existingAddress.City || '', Validators.required],
      State: [this._existingAddress.State || null, Validators.required],
      Zip: [this._existingAddress.Zip || '', Validators.required],
      Phone: [this._existingAddress.Phone || ''],
      Country: [this._existingAddress.Country || null, Validators.required],
      ID: this._existingAddress.ID || '',
    });
  }

  protected onSubmit() {
    if (this.addressForm.status === 'INVALID') {
      return this.formErrorService.displayFormErrors(this.addressForm);
    }
    this.formSubmitted.emit({
      address: this.addressForm.value,
      formDirty: this.addressForm.dirty,
    });
  }

  // control display of error messages
  protected hasRequiredError = (controlName: string) =>
    this.formErrorService.hasRequiredError(controlName, this.addressForm);
  protected hasValidEmailError = () =>
    this.formErrorService.hasValidEmailError(this.addressForm.get('Email'));
}

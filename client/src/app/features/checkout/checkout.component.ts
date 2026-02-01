import { Component, inject, OnInit, signal } from '@angular/core';
import { OrderSummaryComponent } from "../../shared/components/order-summary/order-summary.component";
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { Router, RouterLink } from "@angular/router";
import { MatAnchor, MatButton } from "@angular/material/button";
import { StripeService } from '../../core/services/stripe.service';
import { ConfirmationToken, StripeAddressElement, StripeAddressElementChangeEvent, StripePaymentElement, StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { SnackbarService } from '../../core/services/snackbar.service';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Address } from '../../shared/models/user';
import { firstValueFrom } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { CheckoutDeliveryComponent } from "../../feature/checkout/checkout-delivery/checkout-delivery.component";
import { CheckoutReviewComponent } from "../../feature/checkout/checkout-review/checkout-review.component";
import { CartService } from '../../core/services/cart.service';
import { CurrencyPipe, JsonPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [OrderSummaryComponent, MatStepperModule, RouterLink, MatAnchor,
    MatButton, MatCheckboxModule, CheckoutDeliveryComponent, CheckoutReviewComponent, CurrencyPipe, JsonPipe, MatProgressSpinnerModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private stripService = inject(StripeService);
  private snackbar = inject(SnackbarService)
  private accountService = inject(AccountService);
  cartService = inject(CartService);
  private router = inject(Router);
  addressElements?: StripeAddressElement;
  saveAddress = false;
  paymentElement?: StripePaymentElement;
  completionStatus = signal<{ address: boolean, card: boolean, delivery: boolean }>({
    address: false, card: false, delivery: false
  })
  confirmationToken?: ConfirmationToken;
  loading = false;

  async ngOnInit() {
    try {
      this.addressElements = await this.stripService.CreateAddressElements();
      this.addressElements?.mount('#address-element');
      this.addressElements?.on('change', this.handleAdressChange);

      this.paymentElement = await this.stripService.CreatePaymentElement();
      this.paymentElement?.mount('#payment-element');
      this.paymentElement?.on('change', this.handlePaymentChange);

    } catch (error: any) {
      this.snackbar.error(error.message)
    }
  }

  handleAdressChange = (event: StripeAddressElementChangeEvent) => {
    this.completionStatus.update(state => { state.address = event.complete; return state; })
  }

  handlePaymentChange = (event: StripePaymentElementChangeEvent) => {
    this.completionStatus.update(state => { state.card = event.complete; return state; })
  }

  handleDeliveryChange(event: boolean) {
    this.completionStatus.update(state => {
      state.delivery = event;
      return state;
    })
  }

  async onStepChange(event: StepperSelectionEvent) {
    if (event.selectedIndex === 1) {
      if (this.saveAddress) {
        const address = await this.getAddressFromStripeAddress();
        address && firstValueFrom(this.accountService.updateAdress(address));
      }
    }

    if (event.selectedIndex === 2) {
      await firstValueFrom(this.stripService.createOrUpdatePaymentIntent());
    }

    if (event.selectedIndex === 3) {
      await this.getConfirmationToken();
    }

  }

  async getConfirmationToken() {
    try {
      if (Object.values(this.completionStatus()).every(status => status === true)) {
        const result = await this.stripService.createConfirmationStatus();
        if (result.error) throw new Error(result.error.message)
        this.confirmationToken = result.confirmationToken;
        console.log(this.confirmationToken)
      }
    } catch (error: any) {
      this.snackbar.error(error.message);
    }

  }

  async confirmPayment(stepper: MatStepper) {
    this.loading = true;
    try {
      if (this.confirmationToken) {
        const result = await this.stripService.confirmPayment(this.confirmationToken);
        if (result.error) {
          throw new Error(result.error.message);
        } else {
          this.cartService.deleteCart();
          this.cartService.SelectedDelivery.set(null);
          this.router.navigateByUrl('checkout/success');
        }
      }
    } catch (error: any) {
      this.snackbar.error(error.message || 'Somthing went wrong');
      stepper.previous();
    }
    finally {
      this.loading = false;
    }
  }

  private async getAddressFromStripeAddress(): Promise<Address | null> {
    const result = await this.addressElements?.getValue();
    const address = result?.value.address;

    if (address) {
      return {
        line1: address.line1,
        line2: address.line2 || "",
        city: address.city,
        country: address.country,
        state: address.state,
        postalCode: address.postal_code
      }
    }
    else {
      return null;
    }

  }

  onSaveAdressCheckBoxChange(event: MatCheckboxChange) {
    this.saveAddress = event.checked;
  }

  ngOnDestory(): void {
    this.stripService.disposeElements();
  }
}

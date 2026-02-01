import { inject, Injectable } from '@angular/core';
import { ConfirmationToken, loadStripe, Stripe, StripeAddressElement, StripeAddressElementOptions, StripeElement, StripeElements, StripePaymentElement } from '@stripe/stripe-js'
import { environment } from '../../../environments/environment.development';
import { CartService } from './cart.service';
import { HttpClient } from '@angular/common/http';
import { Cart } from '../../shared/models/cart';
import { firstValueFrom, map } from 'rxjs';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private cartService = inject(CartService);
  private accountService = inject(AccountService);
  private stripePromise: Promise<Stripe | null>;
  private elements?: StripeElements;
  private addressElements?: StripeAddressElement;
  private paymentElement?: StripePaymentElement;

  constructor() {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  getStripeInstance() {
    return this.stripePromise;
  }

  async initializeElements() {
    if (!this.elements) {
      const stripe = await this.getStripeInstance();

      if (stripe) {
        const cart = await firstValueFrom(this.createOrUpdatePaymentIntent());
        this.elements = stripe.elements({ clientSecret: cart.clientSecret, appearance: { labels: 'floating' } })
      } else {
        throw new Error('Stripe is not loaded');
      }
    }
    return this.elements;
  }

  async CreateAddressElements() {
    if (!this.addressElements) {
      const elements = await this.initializeElements();
      if (elements) {
        const user = this.accountService.currentUser();
        let defaultValues: StripeAddressElementOptions['defaultValues'] = {};

        if (user) {
          defaultValues.name = user.firstName + ' ' + user.lastName;
        }

        if (user?.address) {
          defaultValues.address = {
            line1: user.address.line1,
            line2: user.address.line2,
            city: user.address.city,
            state: user.address.state,
            country: user.address.country,
            postal_code: user.address.postalCode
          }
        }
        const options: StripeAddressElementOptions = {
          mode: 'shipping',
          defaultValues
        };
        this.addressElements = elements.create('address', options);
      }
    } else {
      throw new Error('Elements instance is not been loaded');
    }
    return this.addressElements;
  }

  async createConfirmationStatus() {
    const strip = await this.getStripeInstance();
    const elements = await this.initializeElements();
    const result = await elements.submit();
    if (result.error) throw Error(result.error.message);
    if (strip) {
      return await strip.createConfirmationToken({ elements })
    } else {
      throw new Error('Strip mot available')
    }
  }

  async CreatePaymentElement() {
    if (!this.paymentElement) {
      const element = await this.initializeElements();
      if (element) {
        this.paymentElement = element.create('payment');
      } else {
        throw new Error('Element instance has not been initialized');
      }
    }
    return this.paymentElement;
  }

  async confirmPayment(confimationToken: ConfirmationToken) {
    const strip = await this.getStripeInstance();
    const elements = await this.initializeElements();
    const result = await elements.submit();

    if (result.error) throw Error(result.error.message);

    const clientSecret = this.cartService.cart()?.clientSecret;

    if (strip && clientSecret) {
      return await strip.confirmPayment({
        clientSecret: clientSecret,
        confirmParams: {
          confirmation_token: confimationToken.id
        },
        redirect: 'if_required'
      })
    } else {
      throw new Error('Unable to load strip');
    }
  }

  createOrUpdatePaymentIntent() {
    const cart = this.cartService.cart();
    if (!cart) throw new Error('Problem with cart');
    return this.http.post<Cart>(this.baseUrl + 'payment/' + cart.id, {}).pipe(
      map(cart => {
        this.cartService.setCart(cart);
        return cart;
      })
    );
  }

  disposeElements() {
    this.elements = undefined;
    this.addressElements = undefined;
    this.paymentElement = undefined;
  }
}

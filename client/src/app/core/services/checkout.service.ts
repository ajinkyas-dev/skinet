import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, of } from 'rxjs';
import { DeliveryMethods } from '../../shared/models/deliveryMethods';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {

  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  deliveryMethods: DeliveryMethods[] = [];

  getDeliveryMethod() {
    if (this.deliveryMethods.length > 0) return of(this.deliveryMethods)
    return this.http.get<DeliveryMethods[]>(this.baseUrl + 'payment/delivery-method').pipe(
      map(method => {
        this.deliveryMethods = method.sort((a, b) => b.price - a.price);
        return method;
      }))
  }
}

import { Component, inject, input } from '@angular/core';
import { CartItems } from '../../../shared/models/cart';
import { RouterLink } from "@angular/router";
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [RouterLink, MatButton, MatIcon, MatIconButton, CurrencyPipe],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss',
})
export class CartItemComponent {
  item = input.required<CartItems>();
  cartService = inject(CartService);

  incrementQuantity() {
    this.cartService.addItemToCart(this.item());
  }

  decrmentQuantity() {
    this.cartService.removeItemFromCart(this.item().productId);
  }

  removeItemFromCart() {
    this.cartService.removeItemFromCart(this.item().productId, this.item().quantity);
  }
}

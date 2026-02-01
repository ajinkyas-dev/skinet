import { RouterLinkActive, Routes } from '@angular/router';
import { HomeComponent } from './feature/home/home.component';
import { ShopComponent } from './feature/shop/shop.component';
import { ProductDetailsComponent } from './feature/shop/product-details/product-details.component';
import { TestErrorComponent } from './feature/test-error/test-error.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { ServerErrorComponent } from './shared/server-error/server-error.component';
import { CartComponent } from './feature/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { LoginComponent } from './feature/account/login/login.component';
import { RegisterComponent } from './feature/account/register/register.component';
import { authGuard } from './core/gaurds/auth-guard';
import { emptyCartGuard } from './core/gaurds/empty-cart-guard';
import { CheckoutSuccessComponent } from './feature/checkout/checkout-success/checkout-success.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'shop', component: ShopComponent },
    { path: 'shop/:id', component: ProductDetailsComponent },
    { path: 'cart', component: CartComponent },
    { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard,emptyCartGuard] },
    { path: 'checkout/success', component: CheckoutSuccessComponent, canActivate: [authGuard] },
    { path: 'account/login', component: LoginComponent },
    { path: 'account/register', component: RegisterComponent },
    { path: 'test-error', component: TestErrorComponent },
    { path: 'not-found', component: NotFoundComponent },
    { path: 'server-error', component: ServerErrorComponent },
    { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
];
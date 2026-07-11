/* eslint-disable no-else-return */
/* eslint-disable max-lines-per-function */
import { Cart, LineItem } from '@commercetools/platform-sdk';
import Component from '../../components/abstract/component';
import State from '../../services/state';
import {
  SetDiscount,
  SetDiscountAnonim,
  GetAnonimCartByID,
  GetCartByID,
  UpdateAnonimCartProdQuantity,
  RemoveFromCart,
  RemoveFromAnonimCart,
  RemoveSeveralFromCart,
  RemoveSeveralFromAnonimCart,
  UpdateCustomerCartProdQuantity,
  RemoveFirstVisitCode
} from '../../api/apiMethods';
import Router from '../../services/router/router';
import { createElem } from '../../services/viewBuilderFunction';

// export const createElem = (className: string, tag = 'div'): HTMLElement =>
//   Object.assign(document.createElement(tag), { className });

export default class CartView extends Component {
  private cartContainer: HTMLElement;

  constructor() {
    super();
    this.container.className = 'cart';
    this.renderHeading();
    this.cartContainer = createElem('cart-container');
    this.container.appendChild(this.cartContainer);
  }

  public async renderHeading(): Promise<void> {
    const cartWrapper = createElem('cart-title_wrapper');
    const cartBg = createElem('cart-background-image');
    const cartTitle = createElem('cart-title', 'h1');
    cartTitle.innerText = 'Cart';
    cartWrapper.appendChild(cartBg);
    cartBg.appendChild(cartTitle);
    this.container.appendChild(cartWrapper);
  }

  private async renderCart(): Promise<void> {
    const productsContainer = createElem('cart-products-container');
    const productsTitle = createElem('cart-products-title');
    productsTitle.innerHTML = `
      <div class="title-column">Image</div>
      <div class="title-column">Name</div>
      <div class="title-column">Item Price</div>
      <div class="title-column">Quantity</div>
      <div class="title-column">Total price</div>
      <div class="title-column title-empty"></div>
    `;
    productsContainer.append(productsTitle);

    const cart = State.cart?.body;
    if (cart && cart.lineItems) {
      cart.lineItems.forEach((productItem) => {
        const cartItem = this.renderCartItem(productItem);
        productsContainer.append(cartItem);
      });
    }

    const resetButton = createElem('reset-cart-button btn btn--blue');
    resetButton.innerHTML = 'Clear cart';
    resetButton.addEventListener('click', async () => {
      await this.clearCart();
    });
    productsContainer.append(resetButton);
    this.cartContainer.append(productsContainer);
  }

  private renderCartItem(product: LineItem): HTMLElement {
    const productElem = createElem('cart-product-item');
    const productImage = createElem('cart-product-image');
    if (product.variant.images) {
      productImage.style.background = `center / contain no-repeat url('${product.variant.images[0].url}') #ffff`;
    }

    const productName = createElem('cart-product-name');
    if (product.productId) {
      productName.innerHTML = product.name.en;
    }

    const productPrice = createElem('cart-product-price');
    if (product.price) {
      if (product.price.discounted) {
        productPrice.innerHTML = `€ ${String(
          (product.price.discounted.value.centAmount / 100).toFixed(2)
        )}`;
      } else {
        productPrice.innerHTML = `€ ${String(
          (product.price.value.centAmount / 100).toFixed(2)
        )}`;
      }
    }

    const productQuantity = createElem('cart-product-quantity');
    const prodQuantNumber = createElem('prod-quantity_number');
    const prodQuantMinus = createElem('prod-quantity_minus');
    const prodQuantPlus = createElem('prod-quantity_plus');
    if (product.quantity) {
      prodQuantNumber.innerHTML = `${product.quantity}`;
      productQuantity.append(prodQuantMinus, prodQuantNumber, prodQuantPlus);
    }
    const lineItemId = product.id;
    prodQuantMinus.addEventListener(
      'click',
      this.minusProductInCart.bind(this, lineItemId)
    );

    prodQuantPlus.addEventListener(
      'click',
      this.plusProductInCart.bind(this, lineItemId)
    );

    const productTotalPrice = createElem('cart-product-price_total');
    if (product.price && product.quantity) {
      if (product.price.discounted) {
        productTotalPrice.innerHTML = `€ ${String(
          (
            (product.price.discounted.value.centAmount * product.quantity) /
            100
          ).toFixed(2)
        )}`;
      } else {
        productTotalPrice.innerHTML = `€ ${String(
          ((product.price.value.centAmount * product.quantity) / 100).toFixed(2)
        )}`;
      }
    }

    const productRemove = createElem('cart-product-remove', 'button');
    productRemove.classList.add('btn', 'btn--blue');
    productRemove.innerHTML = 'Remove';
    productRemove.addEventListener(
      'click',
      this.removeProductFromCart.bind(this, lineItemId)
    );

    productElem.append(
      productImage,
      productName,
      productPrice,
      productQuantity,
      productTotalPrice,
      productRemove
    );

    return productElem;
  }

  public async getCurrentCartVersion(CART_ID: string): Promise<Cart> {
    try {
      const response = await GetCartByID(CART_ID);
      const { body } = response;
      return body;
    } catch (error) {
      console.error('Something went wrong:', error);
      throw error;
    }
  }

  public async getCurrentAnonimCartVersion(CART_ID: string): Promise<Cart> {
    try {
      const response = await GetAnonimCartByID(CART_ID);
      const { body } = response;
      return body;
    } catch (error) {
      console.error('Something went wrong:', error);
      throw error;
    }
  }

  private async minusProductInCart(LINE_ITEM_ID: string): Promise<void> {
    const CART_ID = localStorage.getItem('cartID');
    if (CART_ID && LINE_ITEM_ID) {
      try {
        const CUSTOMER_ID = localStorage.getItem('customerID');
        if (CUSTOMER_ID) {
          const CART_INFO = await this.getCurrentCartVersion(CART_ID);
          const lineItem = CART_INFO.lineItems.find(
            (item) => item.id === LINE_ITEM_ID
          );
          if (lineItem) {
            const QUANTITY = lineItem.quantity - 1;
            const VERSION = CART_INFO.version;
            await UpdateCustomerCartProdQuantity(
              CART_ID,
              VERSION,
              LINE_ITEM_ID,
              QUANTITY
            );
          }
        } else {
          const CART_INFO = await this.getCurrentAnonimCartVersion(CART_ID);
          const lineItem = CART_INFO.lineItems.find(
            (item) => item.id === LINE_ITEM_ID
          );
          if (lineItem) {
            const QUANTITY = lineItem.quantity - 1;
            const VERSION = CART_INFO.version;
            await UpdateAnonimCartProdQuantity(
              CART_ID,
              VERSION,
              LINE_ITEM_ID,
              QUANTITY
            );
          }
        }
        await this.refreshCart();
        const cartChange = new Event('cart-change');
        window.dispatchEvent(cartChange);
      } catch (error) {
        console.error('Error getting cart version:', error);
      }
    }
  }

  private async plusProductInCart(LINE_ITEM_ID: string): Promise<void> {
    const CART_ID = localStorage.getItem('cartID');
    if (CART_ID && LINE_ITEM_ID) {
      try {
        const CUSTOMER_ID = localStorage.getItem('customerID');
        if (CUSTOMER_ID) {
          const CART_INFO = await this.getCurrentCartVersion(CART_ID);
          const lineItem = CART_INFO.lineItems.find(
            (item) => item.id === LINE_ITEM_ID
          );
          if (lineItem) {
            const QUANTITY = lineItem.quantity + 1;
            const VERSION = CART_INFO.version;
            await UpdateCustomerCartProdQuantity(
              CART_ID,
              VERSION,
              LINE_ITEM_ID,
              QUANTITY
            );
          }
        } else {
          const CART_INFO = await this.getCurrentAnonimCartVersion(CART_ID);
          const lineItem = CART_INFO.lineItems.find(
            (item) => item.id === LINE_ITEM_ID
          );
          if (lineItem) {
            const QUANTITY = lineItem.quantity + 1;
            const VERSION = CART_INFO.version;
            await UpdateAnonimCartProdQuantity(
              CART_ID,
              VERSION,
              LINE_ITEM_ID,
              QUANTITY
            );
          }
        }
        await this.refreshCart();
      } catch (error) {
        console.error('Error getting cart version:', error);
      }
    }
  }

  private async removeProductFromCart(LINE_ITEM_ID: string): Promise<void> {
    try {
      const CART_ID = localStorage.getItem('cartID');
      if (CART_ID) {
        const CUSTOMER_ID = localStorage.getItem('customerID');
        if (CUSTOMER_ID) {
          await RemoveFromCart(
            CART_ID,
            (await this.getCurrentCartVersion(CART_ID)).version,
            LINE_ITEM_ID
          );
        } else {
          await RemoveFromAnonimCart(
            CART_ID,
            (await this.getCurrentAnonimCartVersion(CART_ID)).version,
            LINE_ITEM_ID
          );
        }
      }
      await this.refreshCart();
      const cartChange = new Event('cart-change');
      window.dispatchEvent(cartChange);
    } catch (error) {
      console.error('Error getting cart version:', error);
    }
  }

  private async clearCart(): Promise<void> {
    try {
      const catalogItemIds = State.cart?.body.lineItems.map(
        (item) => item.id
      ) as string[];
      const CART_ID = localStorage.getItem('cartID');
      if (CART_ID) {
        const CUSTOMER_ID = localStorage.getItem('customerID');
        if (CUSTOMER_ID) {
          await RemoveSeveralFromCart(
            CART_ID,
            (await this.getCurrentCartVersion(CART_ID)).version,
            catalogItemIds
          );
        } else {
          await RemoveSeveralFromAnonimCart(
            CART_ID,
            (await this.getCurrentAnonimCartVersion(CART_ID)).version,
            catalogItemIds
          );
        }
      }
      await this.refreshCart();
      const cartChange = new Event('cart-change');
      window.dispatchEvent(cartChange);
    } catch (error) {
      console.error('Error getting cart version:', error);
    }
  }

  private renderCartTotal(): void {
    const cart = State.cart?.body;
    const discountCodes = State.cart?.body.discountCodes;
    const totalContainer = createElem('cart-total-container');

    if (discountCodes && discountCodes.length > 0) {
      totalContainer.classList.add('discount');
    }
    const orderBtn = createElem('cart-order btn--blue btn btn--small');
    orderBtn.textContent = 'Order';
    orderBtn.addEventListener('click', async () => {
      try {
        this.removeFirstVisitCode();
      } catch (error) {
        console.error('Error getting cart version:', error);
      }
    });
    const subtotalPrice = createElem('cart-subtotal-price');
    const subtotalTitle = createElem('cart-subtotal-title');
    subtotalTitle.innerHTML = 'Subtotal:';
    const subtotalAmount = createElem('cart-subtotal-amount');
    if (cart && cart.lineItems) {
      const amount = cart.lineItems.reduce((accumulator, currentItem) => {
        if (currentItem.price.discounted) {
          const itemTotal =
            currentItem.price.discounted.value.centAmount *
            currentItem.quantity;
          return accumulator + itemTotal;
        } else {
          const itemTotal =
            currentItem.price.value.centAmount * currentItem.quantity;
          return accumulator + itemTotal;
        }
      }, 0);
      subtotalAmount.innerHTML = `€ ${String((amount / 100).toFixed(2))}`;
    }
    subtotalPrice.append(subtotalTitle, subtotalAmount);

    const totalPrice = createElem('cart-total-price');
    const totalTitle = createElem('cart-total-title');
    totalTitle.innerHTML = 'Total:';
    const totalAmount = createElem('cart-total-amount');
    if (cart && cart.totalPrice) {
      totalAmount.innerHTML = `€ ${String(
        (cart.totalPrice.centAmount / 100).toFixed(2)
      )}`;
    }
    totalPrice.append(totalTitle, totalAmount);

    const discountApplied = createElem('cart-discount-applied');
    discountApplied.innerHTML = `Discount applied`;

    const discountContainer = createElem('cart-discount-container');
    const discountInput = createElem(
      'cart-discount-input',
      'input'
    ) as HTMLInputElement;
    discountInput.setAttribute('type', 'text');
    discountInput.setAttribute('placeholder', 'Promo code');
    const discountBtn = createElem('cart-discount-btn', 'button');
    discountBtn.classList.add('btn', 'btn--yellow');
    discountBtn.innerHTML = 'OK';
    discountBtn.addEventListener('click', async () => {
      try {
        const code = discountInput.value;
        this.setDiscount(code);
        await this.refreshCart();
      } catch (error) {
        console.error('Error getting cart version:', error);
      }
    });
    discountContainer.append(discountInput, discountBtn);

    totalContainer.append(
      subtotalPrice,
      discountApplied,
      totalPrice,
      discountContainer,
      orderBtn
    );
    this.cartContainer.append(totalContainer);
  }

  private async removeFirstVisitCode(): Promise<void> {
    const CART_ID = localStorage.getItem('cartID');
    const discountCodes = State.cart?.body.discountCodes;
    if (!discountCodes) throw new Error('err in DC');
    if (CART_ID) {
      try {
        const CUSTOMER_ID = localStorage.getItem('customerID');
        const VERSION = CUSTOMER_ID
          ? (await this.getCurrentCartVersion(CART_ID)).version
          : (await this.getCurrentAnonimCartVersion(CART_ID)).version;

        if (discountCodes.length === 0) {
          await this.refreshCart();
        } else {
          await RemoveFirstVisitCode(
            CART_ID,
            VERSION,
            discountCodes[0].discountCode
          );
          await this.refreshCart();
        }
      } finally {
        const condition = discountCodes.length !== 0;
        this.writeMsg(condition);
      }
    }
  }

  private writeMsg(discount = false): void {
    const info = createElem('cart-info-code');
    const totalContainer = document.querySelector('.cart-total-container');
    info.innerHTML = `We've got you order, ${
      discount ? 'discount was applied, ' : ' '
    }thank you!`;
    totalContainer?.append(info);
    setTimeout(() => {
      info.innerHTML = '';
    }, 5000);
  }

  private async setDiscount(code: string): Promise<void> {
    const CART_ID = localStorage.getItem('cartID');
    if (CART_ID) {
      try {
        const CUSTOMER_ID = localStorage.getItem('customerID');
        if (CUSTOMER_ID) {
          const VERSION = (await this.getCurrentCartVersion(CART_ID)).version;
          await SetDiscount(CART_ID, VERSION, code);
        } else {
          const VERSION = (await this.getCurrentAnonimCartVersion(CART_ID))
            .version;
          await SetDiscountAnonim(CART_ID, VERSION, code);
        }
        await this.refreshCart();
      } catch (error) {
        const wrongCode = createElem('cart-wrong-code');
        const totalContainer = document.querySelector('.cart-total-container');
        wrongCode.innerHTML = 'Enter a valid discount code';
        totalContainer?.append(wrongCode);
        const orderBtn = document.querySelector('.cart-order');
        if (orderBtn) {
          totalContainer?.insertBefore(wrongCode, orderBtn);
        }
      }
    }
  }

  private async renderEmptyCart(): Promise<void> {
    const emptyContainer = createElem('cart-empty-container');
    emptyContainer.innerHTML = `
      <div class="cart-empty-title">
        <h3>Your cart is currently empty.</h3>
      </div>
      <div class="cart-empty-btn">
        <a href="${Router.pages.catalog}" class="btn link btn--blue">Shop here</a>
      </div>
    `;
    this.cartContainer.append(emptyContainer);
  }

  private async refreshCart(): Promise<void> {
    await State.refreshCart();
    if (State.cart?.body.lineItems.length === 0) {
      this.cartContainer.innerHTML = '';
      this.renderEmptyCart();
    } else {
      this.cartContainer.innerHTML = '';
      this.renderCart();
      this.renderCartTotal();
    }
  }

  public async renderHTML(): Promise<HTMLElement> {
    await State.setCart(() => {});
    if (State.cart?.body.lineItems.length === 0) {
      this.cartContainer.innerHTML = '';
      this.renderEmptyCart();
    } else {
      this.cartContainer.innerHTML = '';
      this.renderCart();
      this.renderCartTotal();
    }
    return this.container;
  }
}

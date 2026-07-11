/* eslint-disable max-lines-per-function */
/* eslint-disable no-lonely-if */
import {
  Cart,
  CategoryPagedQueryResponse,
  ClientResponse,
  LineItem,
  ProductProjectionPagedQueryResponse
} from '@commercetools/platform-sdk';
import {
  CreateCartAnonim,
  CreateCartCustomer,
  GetAnonimCartByID,
  GetCartByID,
  GetCartFromAnonim,
  GetProductsPublished,
  getProductCategories
} from '../api/apiMethods';

export default abstract class State {
  public static catalog:
    | ClientResponse<ProductProjectionPagedQueryResponse>
    | undefined;
  public static categories:
    | ClientResponse<CategoryPagedQueryResponse>
    | undefined;
  public static cart: ClientResponse<Cart> | undefined;

  public static async setCatalog(handleError: () => void): Promise<void> {
    try {
      State.catalog = await GetProductsPublished();
    } catch {
      handleError();
    }
  }

  public static async setCategories(handleError: () => void): Promise<void> {
    try {
      State.categories = await getProductCategories();
    } catch {
      handleError();
    }
  }

  public static get CategoryMap(): Map<string, string> {
    const categoryMap: Map<string, string> = new Map();
    State.categories?.body.results.forEach((category) => {
      categoryMap.set(`${category.name.en}`, `${category.id}`);
    });
    return categoryMap;
  }

  public static getCurrentCartVersion(CART_ID: string): Promise<number> {
    return GetCartByID(CART_ID)
      .then(({ body }) => {
        return body.version;
      })
      .catch((error) => {
        console.error('Something went wrong:', error);
      });
  }

  public static getCurrentAnonimCartVersion(CART_ID: string): Promise<number> {
    return GetAnonimCartByID(CART_ID)
      .then(({ body }) => {
        return body.version;
      })
      .catch((error) => {
        console.error('Something went wrong:', error);
      });
  }

  public static async setCart(handleError?: () => void): Promise<void> {
    try {
      const CUSTOMER_ID = localStorage.getItem('customerID');
      const CURRENCY = 'EUR';
      const CART_ID = localStorage.getItem('cartID');
      if (CUSTOMER_ID) {
        if (CART_ID) {
          const VERSION = await this.getCurrentCartVersion(CART_ID);
          State.cart = await GetCartFromAnonim(CUSTOMER_ID, CART_ID, VERSION);
        } else {
          console.log('creating');
          State.cart = await CreateCartCustomer(CURRENCY);
          localStorage.setItem('cartID', State.cart.body.id);
        }
      } else {
        if (CART_ID) {
          State.cart = await GetAnonimCartByID(CART_ID);
        } else {
          State.cart = await CreateCartAnonim(CURRENCY);
          localStorage.setItem('cartID', State.cart.body.id);
        }
      }
    } catch {
      if (handleError) handleError();
    }
  }

  public static async refreshCart(handleError?: () => void): Promise<void> {
    try {
      const CART_ID = localStorage.getItem('cartID');
      const CUSTOMER_ID = localStorage.getItem('customerID');
      if (CART_ID) {
        if (CUSTOMER_ID) {
          State.cart = await GetCartByID(CART_ID);
        } else {
          State.cart = await GetAnonimCartByID(CART_ID);
        }

        const cartArray = State.cart?.body.lineItems.map((el) => {
          return el.name.en.toLowerCase();
        });
        const toCartBtns = document.getElementsByClassName('to_cart-btn');
        Array.from(toCartBtns).forEach((el) => {
          const productName = el.getAttribute('data-name');
          if (!productName) throw new Error('err');
          if (cartArray?.includes(productName)) {
            el.setAttribute('disabled', 'true');
          }
        });
      }
    } catch {
      if (handleError) handleError();
    }
  }

  public static async init(
    handleCatalogError: () => void,
    handleCategoriesError: () => void
  ): Promise<void> {
    await this.setCatalog(handleCatalogError);
    await this.setCategories(handleCategoriesError);
    // await this.refreshCart();
  }
}

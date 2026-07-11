/* eslint-disable no-console */
import type {
  Cart,
  CategoryPagedQueryResponse,
  ClientResponse,
  DiscountCodeReference,
  ProductProjectionPagedQueryResponse
} from '@commercetools/platform-sdk';
import { CATEGORIES, PRODUCTS } from './mock/mockData';
import {
  authenticate,
  createCart,
  createCustomerRecord,
  findCustomerByEmail,
  getCart,
  getCartByCustomer,
  getCustomerById,
  mutateCustomer,
  resp,
  seedDemoUsers,
  updateCart,
  uuid,
  StoredCustomer
} from './mock/mockDb';

// Демо-режим: все функции сохраняют сигнатуры старого commercetools-слоя,
// но работают с локальным моком (mock/mockDb.ts + mock/mockData.ts).
// При переезде на реальный бэкенд (Azure) достаточно заменить
// реализации в этом файле на fetch-запросы.

seedDemoUsers();

// Раньше выводила данные проекта commercetools; оставлена для совместимости
export async function GetProjectInfo(): Promise<void> {
  console.log('Demo mode: local mock backend, no remote project');
}

// Каталог товаров (статические фикстуры)
export function GetProductsPublished(): Promise<
  ClientResponse<ProductProjectionPagedQueryResponse>
> {
  return Promise.resolve(
    resp({
      limit: 30,
      offset: 0,
      count: PRODUCTS.length,
      total: PRODUCTS.length,
      results: PRODUCTS
    })
  );
}

export function getProductCategories(): Promise<
  ClientResponse<CategoryPagedQueryResponse>
> {
  return Promise.resolve(
    resp({
      limit: 20,
      offset: 0,
      count: CATEGORIES.length,
      total: CATEGORIES.length,
      results: CATEGORIES
    })
  );
}

// ---------- Чтение корзин ----------
// Разделение «customer/anonim» осталось от commercetools:
// в моке обе ветки работают с одним хранилищем

export function GetCart(CART_ID: string): Promise<ClientResponse> {
  try {
    return Promise.resolve(resp(getCart(CART_ID)));
  } catch (error) {
    return Promise.reject(error);
  }
}

export function GetCartByID(CART_ID: string): Promise<ClientResponse> {
  return GetCart(CART_ID);
}

export function GetActiveCart(): Promise<ClientResponse> {
  try {
    const customerId = localStorage.getItem('customerID');
    if (!customerId) throw new Error('No logged in customer');
    return Promise.resolve(resp(getCartByCustomer(customerId)));
  } catch (error) {
    return Promise.reject(error);
  }
}

export function GetCartByCustomerId(
  CISTOMER_ID: string
): Promise<ClientResponse> {
  try {
    return Promise.resolve(resp(getCartByCustomer(CISTOMER_ID)));
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function GetAnonimCartByID(
  CART_ID: string
): Promise<ClientResponse> {
  return GetCart(CART_ID);
}

// Привязывает анонимную корзину к вошедшему покупателю
export function GetCartFromAnonim(
  CUSTOMER_ID: string,
  CART_ID: string,
  VERSION: number
): Promise<ClientResponse> {
  try {
    return Promise.resolve(
      resp(
        updateCart(CART_ID, [
          { action: 'setCustomerId', customerId: CUSTOMER_ID }
        ])
      )
    );
  } catch (error) {
    return Promise.reject(error);
  }
}

// ---------- Создание корзин ----------

export function CreateCartAnonim(
  CURRENCY: string
): Promise<ClientResponse<Cart>> {
  return Promise.resolve(resp(createCart()));
}

export function CreateCartCustomer(
  CURRENCY: string
): Promise<ClientResponse<Cart>> {
  const customerId = localStorage.getItem('customerID') || undefined;
  return Promise.resolve(resp(createCart(customerId)));
}

// ---------- Изменение корзин ----------

function removeLineItems(
  CART_ID: string,
  productIds: string[]
): Promise<ClientResponse<Cart>> {
  try {
    return Promise.resolve(
      resp(
        updateCart(
          CART_ID,
          productIds.map((id) => {
            return { action: 'removeLineItem' as const, lineItemId: id };
          })
        )
      )
    );
  } catch (error) {
    return Promise.reject(error);
  }
}

export function RemoveFromCart(
  CART_ID: string,
  VERSION: number,
  productId: string
): Promise<ClientResponse<Cart>> {
  return removeLineItems(CART_ID, [productId]);
}

export function RemoveFromAnonimCart(
  CART_ID: string,
  VERSION: number,
  productId: string
): Promise<ClientResponse<Cart>> {
  return removeLineItems(CART_ID, [productId]);
}

export function RemoveSeveralFromCart(
  CART_ID: string,
  VERSION: number,
  productIds: string[]
): Promise<ClientResponse<Cart>> {
  return removeLineItems(CART_ID, productIds);
}

export function RemoveSeveralFromAnonimCart(
  CART_ID: string,
  VERSION: number,
  productIds: string[]
): Promise<ClientResponse<Cart>> {
  return removeLineItems(CART_ID, productIds);
}

function addLineItem(
  CART_ID: string,
  productId: string,
  variantId: number,
  quantity: number
): Promise<ClientResponse<Cart>> {
  try {
    return Promise.resolve(
      resp(
        updateCart(CART_ID, [
          { action: 'addLineItem', productId, variantId, quantity }
        ])
      )
    );
  } catch (error) {
    return Promise.reject(error);
  }
}

export function addToCart(
  CART_ID: string,
  VERSION: number,
  productId: string,
  variantId: number,
  quantity: number
): Promise<ClientResponse<Cart>> {
  return addLineItem(CART_ID, productId, variantId, quantity);
}

export function addToAnonimCart(
  CART_ID: string,
  VERSION: number,
  productId: string,
  variantId: number,
  quantity: number
): Promise<ClientResponse<Cart>> {
  return addLineItem(CART_ID, productId, variantId, quantity);
}

function changeQuantity(
  CART_ID: string,
  LINE_ITEM_ID: string,
  QUANTITY: number
): Promise<ClientResponse<Cart>> {
  try {
    return Promise.resolve(
      resp(
        updateCart(CART_ID, [
          {
            action: 'changeLineItemQuantity',
            lineItemId: LINE_ITEM_ID,
            quantity: QUANTITY
          }
        ])
      )
    );
  } catch (error) {
    return Promise.reject(error);
  }
}

export function UpdateCartProdQuantity(
  CART_ID: string,
  VERSION: number,
  LINE_ITEM_ID: string,
  QUANTITY: number
): Promise<ClientResponse<Cart>> {
  return changeQuantity(CART_ID, LINE_ITEM_ID, QUANTITY);
}

export function UpdateCustomerCartProdQuantity(
  CART_ID: string,
  VERSION: number,
  LINE_ITEM_ID: string,
  QUANTITY: number
): Promise<ClientResponse<Cart>> {
  return changeQuantity(CART_ID, LINE_ITEM_ID, QUANTITY);
}

export function UpdateAnonimCartProdQuantity(
  CART_ID: string,
  VERSION: number,
  LINE_ITEM_ID: string,
  QUANTITY: number
): Promise<ClientResponse<Cart>> {
  // Событие оставлено как в старой версии: по нему шапка обновляет счётчик
  const cartChange = new Event('cart-change');
  window.dispatchEvent(cartChange);
  return changeQuantity(CART_ID, LINE_ITEM_ID, QUANTITY);
}

// ---------- Промокоды ----------

function applyDiscount(
  CART_ID: string,
  DISCOUNT_CODE: string
): Promise<ClientResponse<Cart>> {
  try {
    return Promise.resolve(
      resp(updateCart(CART_ID, [{ action: 'addDiscountCode', code: DISCOUNT_CODE }]))
    );
  } catch (error) {
    // Неверный код: корзина покажет «Enter a valid discount code»
    return Promise.reject(error);
  }
}

export function SetDiscount(
  CART_ID: string,
  VERSION: number,
  DISCOUNT_CODE: string
): Promise<ClientResponse<Cart>> {
  return applyDiscount(CART_ID, DISCOUNT_CODE);
}

export function SetDiscountAnonim(
  CART_ID: string,
  VERSION: number,
  DISCOUNT_CODE: string
): Promise<ClientResponse<Cart>> {
  return applyDiscount(CART_ID, DISCOUNT_CODE);
}

export function RemoveFirstVisitCode(
  CART_ID: string,
  VERSION: number,
  DISCOUNT_CODE: DiscountCodeReference
): Promise<ClientResponse<Cart>> {
  try {
    return Promise.resolve(
      resp(
        updateCart(CART_ID, [
          { action: 'removeDiscountCode', discountCode: DISCOUNT_CODE }
        ])
      )
    );
  } catch (error) {
    return Promise.reject(error);
  }
}

// ---------- Покупатели ----------

export function CreateCustomer(EMAIL: string, PASSWORD: string): void {
  try {
    const customer = createCustomerRecord({ email: EMAIL, password: PASSWORD });
    console.log(customer.email);
  } catch (error) {
    console.error(error);
  }
}

// Данные текущего покупателя (по customerID из localStorage)
export function QueryCustomer(): Promise<ClientResponse> {
  try {
    const customerId = localStorage.getItem('customerID');
    if (!customerId) throw new Error('No logged in customer');
    return Promise.resolve(resp(getCustomerById(customerId)));
  } catch (error) {
    return Promise.reject(error);
  }
}

export function QueryCustomerById(
  CUSTOMER_ID: string
): Promise<ClientResponse> {
  try {
    return Promise.resolve(resp(getCustomerById(CUSTOMER_ID)));
  } catch (error) {
    return Promise.reject(error);
  }
}

export function EditCustomerById(
  CUSTOMER_ID: string,
  FISRT_NAME: string,
  LAST_NAME: string,
  DATE_OF_BIRTH: string,
  EMAIL: string,
  VERSION: number
): Promise<ClientResponse> {
  try {
    const updated = mutateCustomer(CUSTOMER_ID, (record) => {
      const editable = record as {
        firstName?: string;
        lastName?: string;
        dateOfBirth?: string;
        email: string;
      };
      editable.firstName = FISRT_NAME;
      editable.lastName = LAST_NAME;
      editable.dateOfBirth = DATE_OF_BIRTH;
      editable.email = EMAIL;
    });
    return Promise.resolve(resp(updated));
  } catch (error) {
    return Promise.reject(error);
  }
}

export function ChangePassword(
  CUSTOMER_ID: string,
  PASS_OLD: string,
  PASS_NEW: string,
  VERSION: number
): Promise<ClientResponse> {
  try {
    const updated = mutateCustomer(CUSTOMER_ID, (record) => {
      if (record.password !== PASS_OLD) {
        throw new Error('The given current password does not match');
      }
      const editable = record as StoredCustomer;
      editable.password = PASS_NEW;
    });
    return Promise.resolve(resp(updated));
  } catch (error) {
    return Promise.reject(error);
  }
}

export function EditAddressById(
  CUSTOMER_ID: string,
  ADDRESS_ID: string,
  STREET_NAME: string,
  CITY: string,
  STATE: string,
  COUNTRY: string,
  POSTAL_CODE: string,
  VERSION: number
): Promise<ClientResponse> {
  try {
    const updated = mutateCustomer(CUSTOMER_ID, (record) => {
      const address = record.addresses.find(
        (candidate) => candidate.id === ADDRESS_ID
      );
      if (!address) throw new Error(`Address ${ADDRESS_ID} not found`);
      const editable = address as {
        streetName?: string;
        city?: string;
        state?: string;
        country: string;
        postalCode?: string;
      };
      editable.streetName = STREET_NAME;
      editable.city = CITY;
      editable.state = STATE;
      editable.country = COUNTRY;
      editable.postalCode = POSTAL_CODE;
    });
    return Promise.resolve(resp(updated));
  } catch (error) {
    return Promise.reject(error);
  }
}

export function SetDefaultShipAdr(
  CUSTOMER_ID: string,
  ADDRESS_ID: string,
  DEF_SHIPPING: boolean,
  VERSION: number
): Promise<ClientResponse> {
  try {
    const updated = mutateCustomer(CUSTOMER_ID, (record) => {
      const editable = record as { defaultShippingAddressId?: string };
      editable.defaultShippingAddressId = DEF_SHIPPING ? ADDRESS_ID : undefined;
    });
    return Promise.resolve(resp(updated));
  } catch (error) {
    return Promise.reject(error);
  }
}

export function SetDefaultBillAdr(
  CUSTOMER_ID: string,
  ADDRESS_ID: string,
  DEF_BILLING: boolean,
  VERSION: number
): Promise<ClientResponse> {
  try {
    const updated = mutateCustomer(CUSTOMER_ID, (record) => {
      const editable = record as { defaultBillingAddressId?: string };
      editable.defaultBillingAddressId = DEF_BILLING ? ADDRESS_ID : undefined;
    });
    return Promise.resolve(resp(updated));
  } catch (error) {
    return Promise.reject(error);
  }
}

export function QueryCustomerByEmail(EMAIL: string): void {
  const customer = findCustomerByEmail(EMAIL);
  if (!customer) {
    console.log('This email address has not been registered.');
  } else {
    console.log(customer.id);
  }
}

export function AuthenticateCustomer(EMAIL: string, PASSWORD: string): void {
  try {
    const customer = authenticate(EMAIL, PASSWORD);
    console.log(customer.id);
    console.log(customer.email);
  } catch (error) {
    console.error(error);
  }
}

// Экспорт для будущего бэкенда: генерация ID в одном месте
export { uuid };

/* eslint-disable no-console */
import type {
  Cart,
  CategoryPagedQueryResponse,
  ClientResponse,
  DiscountCodeReference,
  ProductProjectionPagedQueryResponse
} from '@commercetools/platform-sdk';

// Реальный бэкенд (ASP.NET Core + EF Core). Все функции сохранили прежние
// сигнатуры мок-слоя, но теперь ходят по HTTP в /api. Формат ответа
// { body, statusCode } совпадает с ClientResponse SDK, поэтому страницы не менялись.
// Параметр VERSION больше не нужен (версию ведёт сервер) — он игнорируется.

const API_BASE = '/api';

// Генерация id (оставлена для совместимости со старым мок-слоем)
export function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Базовый вызов API: оборачивает fetch в формат ClientResponse SDK.
// При не-2xx бросает Error с текстом от сервера — страницы уже ловят reject.
async function api<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<ClientResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      message = (await res.text()) || message;
    } catch {
      /* тело ошибки может быть пустым */
    }
    throw new Error(message);
  }
  const body = res.status === 204 ? undefined : await res.json();
  return { body, statusCode: res.status } as ClientResponse<T>;
}

// Раньше выводила данные проекта commercetools; оставлена для совместимости
export async function GetProjectInfo(): Promise<void> {
  console.log('Backend mode: ASP.NET Core + EF Core');
}

// ---------- Каталог ----------

export function GetProductsPublished(): Promise<
  ClientResponse<ProductProjectionPagedQueryResponse>
> {
  return api<ProductProjectionPagedQueryResponse>('/products');
}

export function getProductCategories(): Promise<
  ClientResponse<CategoryPagedQueryResponse>
> {
  return api<CategoryPagedQueryResponse>('/categories');
}

// ---------- Чтение корзин ----------
// Деление на customer/anonim осталось от commercetools: обе ветки работают одинаково

export function GetCart(CART_ID: string): Promise<ClientResponse> {
  return api(`/carts/${CART_ID}`);
}

export function GetCartByID(CART_ID: string): Promise<ClientResponse> {
  return GetCart(CART_ID);
}

export function GetActiveCart(): Promise<ClientResponse> {
  const customerId = localStorage.getItem('customerID');
  if (!customerId) {
    return Promise.reject(new Error('No logged in customer'));
  }
  return api(`/carts/by-customer/${customerId}`);
}

export function GetCartByCustomerId(
  CUSTOMER_ID: string
): Promise<ClientResponse> {
  return api(`/carts/by-customer/${CUSTOMER_ID}`);
}

export function GetAnonimCartByID(CART_ID: string): Promise<ClientResponse> {
  return GetCart(CART_ID);
}

// Привязывает анонимную корзину к вошедшему покупателю
export function GetCartFromAnonim(
  CUSTOMER_ID: string,
  CART_ID: string,
  VERSION: number
): Promise<ClientResponse> {
  return api(`/carts/${CART_ID}/customer`, {
    method: 'PUT',
    body: JSON.stringify({ customerId: CUSTOMER_ID })
  });
}

// ---------- Создание корзин ----------

export function CreateCartAnonim(
  CURRENCY: string
): Promise<ClientResponse<Cart>> {
  return api<Cart>('/carts', { method: 'POST', body: JSON.stringify({}) });
}

export function CreateCartCustomer(
  CURRENCY: string
): Promise<ClientResponse<Cart>> {
  const customerId = localStorage.getItem('customerID') || null;
  return api<Cart>('/carts', {
    method: 'POST',
    body: JSON.stringify({ customerId })
  });
}

// ---------- Изменение корзин ----------
// Во всех remove/update операциях приходит id позиции корзины (lineItem.id)

function removeLineItem(
  CART_ID: string,
  lineItemId: string
): Promise<ClientResponse<Cart>> {
  return api<Cart>(`/carts/${CART_ID}/line-items/${lineItemId}`, {
    method: 'DELETE'
  });
}

async function removeSeveral(
  CART_ID: string,
  lineItemIds: string[]
): Promise<ClientResponse<Cart>> {
  let last: ClientResponse<Cart> | undefined;
  for (const id of lineItemIds) {
    last = await removeLineItem(CART_ID, id);
  }
  return last ?? (await api<Cart>(`/carts/${CART_ID}`));
}

export function RemoveFromCart(
  CART_ID: string,
  VERSION: number,
  lineItemId: string
): Promise<ClientResponse<Cart>> {
  return removeLineItem(CART_ID, lineItemId);
}

export function RemoveFromAnonimCart(
  CART_ID: string,
  VERSION: number,
  lineItemId: string
): Promise<ClientResponse<Cart>> {
  return removeLineItem(CART_ID, lineItemId);
}

export function RemoveSeveralFromCart(
  CART_ID: string,
  VERSION: number,
  lineItemIds: string[]
): Promise<ClientResponse<Cart>> {
  return removeSeveral(CART_ID, lineItemIds);
}

export function RemoveSeveralFromAnonimCart(
  CART_ID: string,
  VERSION: number,
  lineItemIds: string[]
): Promise<ClientResponse<Cart>> {
  return removeSeveral(CART_ID, lineItemIds);
}

function addLineItem(
  CART_ID: string,
  productId: string,
  quantity: number
): Promise<ClientResponse<Cart>> {
  return api<Cart>(`/carts/${CART_ID}/line-items`, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  });
}

export function addToCart(
  CART_ID: string,
  VERSION: number,
  productId: string,
  variantId: number,
  quantity: number
): Promise<ClientResponse<Cart>> {
  return addLineItem(CART_ID, productId, quantity);
}

export function addToAnonimCart(
  CART_ID: string,
  VERSION: number,
  productId: string,
  variantId: number,
  quantity: number
): Promise<ClientResponse<Cart>> {
  return addLineItem(CART_ID, productId, quantity);
}

function changeQuantity(
  CART_ID: string,
  LINE_ITEM_ID: string,
  QUANTITY: number
): Promise<ClientResponse<Cart>> {
  return api<Cart>(`/carts/${CART_ID}/line-items/${LINE_ITEM_ID}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity: QUANTITY })
  });
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
  return api<Cart>(`/carts/${CART_ID}/discount`, {
    method: 'POST',
    body: JSON.stringify({ code: DISCOUNT_CODE })
  });
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
  return api<Cart>(`/carts/${CART_ID}/discount`, { method: 'DELETE' });
}

// ---------- Покупатели ----------

// Регистрация нового покупателя (используется CustomerControl)
export interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  billing?: {
    country: string;
    streetName?: string;
    postalCode?: string;
    city?: string;
  };
  shipping?: {
    country: string;
    streetName?: string;
    postalCode?: string;
    city?: string;
  };
  defaultBilling?: boolean;
  defaultShipping?: boolean;
  isAdmin?: boolean;
}

export function RegisterCustomer(
  payload: RegisterPayload
): Promise<ClientResponse> {
  return api('/customers/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function LoginCustomer(
  EMAIL: string,
  PASSWORD: string
): Promise<ClientResponse> {
  return api('/customers/login', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
}

export function CreateCustomer(EMAIL: string, PASSWORD: string): void {
  RegisterCustomer({ email: EMAIL, password: PASSWORD })
    .then((customer) => console.log(customer.body.email))
    .catch((error) => console.error(error));
}

// Данные текущего покупателя (по customerID из localStorage)
export function QueryCustomer(): Promise<ClientResponse> {
  const customerId = localStorage.getItem('customerID');
  if (!customerId) {
    return Promise.reject(new Error('No logged in customer'));
  }
  return api(`/customers/${customerId}`);
}

export function QueryCustomerById(
  CUSTOMER_ID: string
): Promise<ClientResponse> {
  return api(`/customers/${CUSTOMER_ID}`);
}

export function EditCustomerById(
  CUSTOMER_ID: string,
  FISRT_NAME: string,
  LAST_NAME: string,
  DATE_OF_BIRTH: string,
  EMAIL: string,
  VERSION: number
): Promise<ClientResponse> {
  return api(`/customers/${CUSTOMER_ID}`, {
    method: 'PUT',
    body: JSON.stringify({
      firstName: FISRT_NAME,
      lastName: LAST_NAME,
      dateOfBirth: DATE_OF_BIRTH,
      email: EMAIL
    })
  });
}

export function ChangePassword(
  CUSTOMER_ID: string,
  PASS_OLD: string,
  PASS_NEW: string,
  VERSION: number
): Promise<ClientResponse> {
  return api(`/customers/${CUSTOMER_ID}/password`, {
    method: 'PUT',
    body: JSON.stringify({ oldPassword: PASS_OLD, newPassword: PASS_NEW })
  });
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
  return api(`/customers/${CUSTOMER_ID}/addresses/${ADDRESS_ID}`, {
    method: 'PUT',
    body: JSON.stringify({
      streetName: STREET_NAME,
      city: CITY,
      state: STATE,
      country: COUNTRY,
      postalCode: POSTAL_CODE
    })
  });
}

export function SetDefaultShipAdr(
  CUSTOMER_ID: string,
  ADDRESS_ID: string,
  DEF_SHIPPING: boolean,
  VERSION: number
): Promise<ClientResponse> {
  return api(`/customers/${CUSTOMER_ID}/default-shipping`, {
    method: 'PUT',
    body: JSON.stringify({ addressId: ADDRESS_ID, value: DEF_SHIPPING })
  });
}

export function SetDefaultBillAdr(
  CUSTOMER_ID: string,
  ADDRESS_ID: string,
  DEF_BILLING: boolean,
  VERSION: number
): Promise<ClientResponse> {
  return api(`/customers/${CUSTOMER_ID}/default-billing`, {
    method: 'PUT',
    body: JSON.stringify({ addressId: ADDRESS_ID, value: DEF_BILLING })
  });
}

export function QueryCustomerByEmail(EMAIL: string): void {
  api<{ id: string }>(`/customers/by-email/${encodeURIComponent(EMAIL)}`)
    .then((customer) => console.log(customer.body.id))
    .catch(() => console.log('This email address has not been registered.'));
}

export function AuthenticateCustomer(EMAIL: string, PASSWORD: string): void {
  LoginCustomer(EMAIL, PASSWORD)
    .then((customer) => {
      console.log(customer.body.id);
      console.log(customer.body.email);
    })
    .catch((error) => console.error(error));
}

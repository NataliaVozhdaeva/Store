import type {
  Address,
  Cart,
  ClientResponse,
  Customer,
  LineItem
} from '@commercetools/platform-sdk';
import { PRODUCTS } from './mockData';

// Мок-«база данных» демо-магазина.
// Покупатели и корзины хранятся в localStorage браузера,
// каталог — в статических фикстурах (mockData.ts).
// Позже этот слой заменяется реальным бэкендом (Azure) без изменения страниц.

const CUSTOMERS_KEY = 'mock_customers';
const CARTS_KEY = 'mock_carts';

// Единственный действующий промокод (рекламируется на главной странице)
export const DISCOUNT_CODE = 'FALL23';
export const DISCOUNT_CODE_ID = 'dc-fall23';
const DISCOUNT_RATE = 0.1; // скидка 10%

// Покупатель в хранилище: публичные данные + пароль (только для демо!)
export interface StoredCustomer extends Customer {
  password: string;
  isAdmin?: boolean;
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Оборачивает данные в формат ответа SDK, который ожидают страницы
export function resp<T>(body: T): ClientResponse<T> {
  return { body, statusCode: 200 };
}

function loadCustomers(): StoredCustomer[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCustomers(customers: StoredCustomer[]): void {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

function loadCarts(): Record<string, Cart> {
  try {
    return JSON.parse(localStorage.getItem(CARTS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveCarts(carts: Record<string, Cart>): void {
  localStorage.setItem(CARTS_KEY, JSON.stringify(carts));
}

// ---------- Покупатели ----------

export interface CustomerDraftMock {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  addresses?: Omit<Address, 'id'>[];
  billingAddresses?: number[];
  shippingAddresses?: number[];
  defaultBillingAddress?: number;
  defaultShippingAddress?: number;
  isAdmin?: boolean;
}

// Создаёт покупателя; при повторном e-mail бросает ошибку —
// страница регистрации показывает модалку «user exists»
export function createCustomerRecord(draft: CustomerDraftMock): Customer {
  const customers = loadCustomers();
  const emailTaken = customers.some(
    (customer) => customer.email.toLowerCase() === draft.email.toLowerCase()
  );
  if (emailTaken) {
    throw new Error(`Customer with email ${draft.email} already exists`);
  }

  const addresses: Address[] = (draft.addresses || []).map((address) => {
    return { ...address, id: uuid() };
  });
  const pickAddressId = (index?: number): string | undefined =>
    index !== undefined ? addresses[index]?.id : undefined;

  const record: StoredCustomer = {
    id: uuid(),
    version: 1,
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    email: draft.email,
    password: draft.password,
    firstName: draft.firstName,
    lastName: draft.lastName,
    dateOfBirth: draft.dateOfBirth,
    addresses,
    billingAddressIds: (draft.billingAddresses || [])
      .map((i) => addresses[i]?.id)
      .filter(Boolean) as string[],
    shippingAddressIds: (draft.shippingAddresses || [])
      .map((i) => addresses[i]?.id)
      .filter(Boolean) as string[],
    defaultBillingAddressId: pickAddressId(draft.defaultBillingAddress),
    defaultShippingAddressId: pickAddressId(draft.defaultShippingAddress),
    isEmailVerified: false,
    authenticationMode: 'Password',
    stores: [],
    isAdmin: draft.isAdmin
  } as unknown as StoredCustomer;

  customers.push(record);
  saveCustomers(customers);
  return toPublicCustomer(record);
}

// Убирает пароль из записи перед отдачей наружу
function toPublicCustomer(record: StoredCustomer): Customer {
  const publicPart: Partial<StoredCustomer> = { ...record };
  delete publicPart.password;
  return publicPart as Customer;
}

export function getCustomerById(id: string): Customer {
  const record = loadCustomers().find((customer) => customer.id === id);
  if (!record) throw new Error(`Customer ${id} not found`);
  return toPublicCustomer(record);
}

export function findCustomerByEmail(email: string): Customer | undefined {
  const record = loadCustomers().find(
    (customer) => customer.email.toLowerCase() === email.toLowerCase()
  );
  return record ? toPublicCustomer(record) : undefined;
}

// Проверяет пару e-mail/пароль; при неудаче бросает ошибку —
// страница логина показывает сообщение о неверных данных
export function authenticate(email: string, password: string): Customer {
  const record = loadCustomers().find(
    (customer) =>
      customer.email.toLowerCase() === email.toLowerCase() &&
      customer.password === password
  );
  if (!record) throw new Error('Invalid credentials');
  return toPublicCustomer(record);
}

// Точечно изменяет запись покупателя и повышает версию
export function mutateCustomer(
  id: string,
  mutate: (record: StoredCustomer) => void
): Customer {
  const customers = loadCustomers();
  const record = customers.find((customer) => customer.id === id);
  if (!record) throw new Error(`Customer ${id} not found`);
  mutate(record);
  (record as { version: number }).version += 1;
  (record as { lastModifiedAt: string }).lastModifiedAt =
    new Date().toISOString();
  saveCustomers(customers);
  return toPublicCustomer(record);
}

// ---------- Корзины ----------

function euro(centAmount: number): Cart['totalPrice'] {
  return {
    type: 'centPrecision',
    currencyCode: 'EUR',
    centAmount,
    fractionDigits: 2
  } as Cart['totalPrice'];
}

// Пересчитывает суммы корзины; если введён промокод — скидка 10% на всё
function recomputeTotals(cart: Cart): void {
  const subtotal = cart.lineItems.reduce((sum, item) => {
    const unit =
      item.price.discounted?.value.centAmount || item.price.value.centAmount;
    return sum + unit * item.quantity;
  }, 0);
  const hasPromo = (cart.discountCodes || []).length > 0;
  const total = hasPromo
    ? Math.round(subtotal * (1 - DISCOUNT_RATE))
    : subtotal;
  (cart as { totalPrice: Cart['totalPrice'] }).totalPrice = euro(total);
}

export function createCart(customerId?: string): Cart {
  const cart = {
    id: uuid(),
    version: 1,
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    customerId,
    lineItems: [],
    totalPrice: euro(0),
    discountCodes: [],
    cartState: 'Active',
    origin: 'Customer',
    taxMode: 'Platform',
    taxRoundingMode: 'HalfEven',
    taxCalculationMode: 'LineItemLevel',
    inventoryMode: 'None',
    itemShippingAddresses: [],
    directDiscounts: [],
    refusedGifts: [],
    shipping: [],
    customLineItems: []
  } as unknown as Cart;

  const carts = loadCarts();
  carts[cart.id] = cart;
  saveCarts(carts);
  return cart;
}

export function getCart(id: string): Cart {
  const cart = loadCarts()[id];
  if (!cart) throw new Error(`Cart ${id} not found`);
  return cart;
}

export function getCartByCustomer(customerId: string): Cart {
  const cart = Object.values(loadCarts()).find(
    (candidate) => candidate.customerId === customerId
  );
  if (!cart) throw new Error(`Cart for customer ${customerId} not found`);
  return cart;
}

// Собирает позицию корзины из товара каталога
function makeLineItem(
  productId: string,
  variantId: number,
  quantity: number
): LineItem {
  const product = PRODUCTS.find((candidate) => candidate.id === productId);
  if (!product) throw new Error(`Product ${productId} not found`);
  return {
    id: uuid(),
    productId: product.id,
    name: product.name,
    productType: product.productType,
    productSlug: product.slug,
    price: product.masterVariant.prices![0],
    quantity,
    variant: {
      id: variantId,
      images: product.masterVariant.images
    },
    totalPrice: euro(
      (product.masterVariant.prices![0].discounted?.value.centAmount ||
        product.masterVariant.prices![0].value.centAmount) * quantity
    ),
    discountedPricePerQuantity: [],
    perMethodTaxRate: [],
    state: [],
    priceMode: 'Platform',
    lineItemMode: 'Standard',
    taxedPricePortions: []
  } as unknown as LineItem;
}

// Действия над корзиной — подмножество commercetools cart update actions,
// которое реально используется страницами приложения
export type CartAction =
  | { action: 'addLineItem'; productId: string; variantId: number; quantity: number }
  | { action: 'removeLineItem'; lineItemId: string }
  | { action: 'changeLineItemQuantity'; lineItemId: string; quantity: number }
  | { action: 'setCustomerId'; customerId: string }
  | { action: 'addDiscountCode'; code: string }
  | { action: 'removeDiscountCode'; discountCode: { typeId: string; id: string } };

export function updateCart(id: string, actions: CartAction[]): Cart {
  const carts = loadCarts();
  const cart = carts[id];
  if (!cart) throw new Error(`Cart ${id} not found`);

  actions.forEach((action) => {
    switch (action.action) {
      case 'addLineItem': {
        // Если товар уже в корзине — просто увеличиваем количество
        const existing = cart.lineItems.find(
          (item) => item.productId === action.productId
        );
        if (existing) {
          (existing as { quantity: number }).quantity += action.quantity;
        } else {
          cart.lineItems.push(
            makeLineItem(action.productId, action.variantId, action.quantity)
          );
        }
        break;
      }
      case 'removeLineItem': {
        (cart as { lineItems: LineItem[] }).lineItems = cart.lineItems.filter(
          (item) => item.id !== action.lineItemId
        );
        break;
      }
      case 'changeLineItemQuantity': {
        // Нулевое количество удаляет позицию (как в commercetools)
        if (action.quantity <= 0) {
          (cart as { lineItems: LineItem[] }).lineItems =
            cart.lineItems.filter((item) => item.id !== action.lineItemId);
        } else {
          const item = cart.lineItems.find(
            (candidate) => candidate.id === action.lineItemId
          );
          if (item) (item as { quantity: number }).quantity = action.quantity;
        }
        break;
      }
      case 'setCustomerId': {
        (cart as { customerId: string }).customerId = action.customerId;
        break;
      }
      case 'addDiscountCode': {
        if (action.code !== DISCOUNT_CODE) {
          throw new Error('Invalid discount code');
        }
        (cart as { discountCodes: Cart['discountCodes'] }).discountCodes = [
          {
            discountCode: { typeId: 'discount-code', id: DISCOUNT_CODE_ID },
            state: 'MatchesCart'
          } as Cart['discountCodes'][number]
        ];
        break;
      }
      case 'removeDiscountCode': {
        (cart as { discountCodes: Cart['discountCodes'] }).discountCodes = (
          cart.discountCodes || []
        ).filter((applied) => applied.discountCode.id !== action.discountCode.id);
        break;
      }
      default:
        break;
    }
  });

  recomputeTotals(cart);
  (cart as { version: number }).version += 1;
  (cart as { lastModifiedAt: string }).lastModifiedAt =
    new Date().toISOString();
  saveCarts(carts);
  return cart;
}

// ---------- Стартовые данные ----------

// Заводит демо-пользователей при первом запуске.
// Админ пригодится при переезде на реальный бэкенд:
// у него уже стоит флаг isAdmin.
export function seedDemoUsers(): void {
  if (loadCustomers().length > 0) return;
  const demoAddress = {
    country: 'DE',
    city: 'Berlin',
    streetName: 'Alexanderplatz 1',
    postalCode: '10178'
  };
  createCustomerRecord({
    email: 'admin@demo.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'Demo',
    dateOfBirth: '1990-01-01',
    addresses: [demoAddress, demoAddress],
    billingAddresses: [0],
    shippingAddresses: [1],
    defaultBillingAddress: 0,
    defaultShippingAddress: 1,
    isAdmin: true
  });
  createCustomerRecord({
    email: 'user@demo.com',
    password: 'User123!',
    firstName: 'Uma',
    lastName: 'User',
    dateOfBirth: '1995-05-05',
    addresses: [demoAddress, demoAddress],
    billingAddresses: [0],
    shippingAddresses: [1],
    defaultBillingAddress: 0,
    defaultShippingAddress: 1
  });
}

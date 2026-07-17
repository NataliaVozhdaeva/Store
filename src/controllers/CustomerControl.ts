import { LoginCustomer, RegisterCustomer } from '../api/apiMethods';

// Регистрация и вход работают через реальный бэкенд (ASP.NET Core + EF Core).
// DOM-логика и события оставлены как были.

// Тело 400-ответа от ASP.NET ([ApiController] + data annotations) — это
// ProblemDetails с полем errors: { FieldName: string[] }. Достаём из него
// читаемый текст для модалки вместо сырого JSON.
function extractErrorMessage(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { errors?: Record<string, string[]> };
    if (parsed.errors) {
      return Object.values(parsed.errors).flat().join(' ');
    }
  } catch {
    /* ответ не JSON — используем текст как есть */
  }
  return raw;
}

export class Customer {
  public createMsg(msg = ''): void {
    document.querySelector<HTMLElement>('.msg')?.remove();
    const insertAfter = (newNode: HTMLElement, referenceNode: HTMLElement) => {
      referenceNode?.parentNode?.insertBefore(
        newNode,
        referenceNode.nextSibling
      );
    };
    const container = document.createElement('div');
    const form = document.querySelector<HTMLElement>('.login-form');
    container.className = 'msg';
    container.textContent = msg;
    if (!form) throw TypeError('smth went wrong...');
    insertAfter(container, form);
  }

  public async createCustomer(
    EMAIL: string,
    PASSWORD: string,
    FIRST_NAME: string,
    LAST_NAME: string,
    DOB: string,
    COUNTRY_BILL: string,
    STREET_BILL: string,
    POST_BILL: string,
    CITY_BILL: string,
    COUNTRY_SHIP: string,
    STREET_SHIP: string,
    POST_SHIP: string,
    CITY_SHIP: string,
    BILLING_DEF: number | undefined,
    SHIPPING_DEF: number | undefined
  ): Promise<void> {
    try {
      const { body: customer } = await RegisterCustomer({
        email: EMAIL,
        password: PASSWORD,
        firstName: FIRST_NAME,
        lastName: LAST_NAME,
        dateOfBirth: DOB,
        billing: {
          country: COUNTRY_BILL,
          streetName: STREET_BILL,
          postalCode: POST_BILL,
          city: CITY_BILL
        },
        shipping: {
          country: COUNTRY_SHIP,
          streetName: STREET_SHIP,
          postalCode: POST_SHIP,
          city: CITY_SHIP
        },
        defaultBilling: BILLING_DEF !== undefined,
        defaultShipping: SHIPPING_DEF !== undefined
      });

      localStorage.setItem('customerID', customer.id);
      const registerSuccessEvent = new CustomEvent(
        'user-registration-success',
        {
          detail: {
            status: 'success',
            firstName: customer.firstName,
            lastName: customer.lastName
          }
        }
      );
      window.dispatchEvent(registerSuccessEvent);
      document.querySelector('.logged-item')?.classList.remove('hidden');
      document.querySelector('.nav-item_login')?.classList.add('hidden');
      document.querySelector('.nav-item_signup')?.classList.add('hidden');
      window.location.hash = 'main';
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const registerRejectEvent =
        message.toLowerCase().includes('already exists')
          ? new CustomEvent('user-registration-fail', {
              detail: { status: 'user exists', email: EMAIL }
            })
          : new CustomEvent('user-registration-fail', {
              detail: { status: 'error', message: extractErrorMessage(message) }
            });
      window.dispatchEvent(registerRejectEvent);
    }
  }

  public async loginCustomer(EMAIL: string, PASSWORD: string): Promise<void> {
    try {
      const { body: customer } = await LoginCustomer(EMAIL, PASSWORD);
      localStorage.setItem('customerID', customer.id);
      localStorage.setItem('isAdmin', String(Boolean(customer.isAdmin)));
      document.querySelector('.logged-item')?.classList.remove('hidden');
      document.querySelector('.nav-item_login')?.classList.add('hidden');
      document.querySelector('.nav-item_signup')?.classList.add('hidden');
      window.location.hash = 'main';
      window.location.reload();
    } catch {
      this.createMsg('Please, be sure your login and password are correct');
    }
  }
}

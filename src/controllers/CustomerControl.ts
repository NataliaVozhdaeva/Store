import { authenticate, createCustomerRecord } from '../api/mock/mockDb';

// Демо-режим: регистрация и вход работают через локальный мок (localStorage),
// внешние сервисы не используются. DOM-логика и события оставлены как были.

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
      const customer = createCustomerRecord({
        email: EMAIL,
        password: PASSWORD,
        firstName: FIRST_NAME,
        lastName: LAST_NAME,
        dateOfBirth: DOB,
        addresses: [
          {
            country: COUNTRY_BILL,
            streetName: STREET_BILL,
            postalCode: POST_BILL,
            city: CITY_BILL
          },
          {
            country: COUNTRY_SHIP,
            streetName: STREET_SHIP,
            postalCode: POST_SHIP,
            city: CITY_SHIP
          }
        ],
        billingAddresses: [0],
        shippingAddresses: [1],
        defaultBillingAddress: BILLING_DEF,
        defaultShippingAddress: SHIPPING_DEF
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
    } catch {
      // Такой e-mail уже зарегистрирован
      const registerRejectEvent = new CustomEvent('user-registration-fail', {
        detail: {
          status: 'user exists',
          email: EMAIL
        }
      });
      window.dispatchEvent(registerRejectEvent);
    }
  }

  public async loginCustomer(EMAIL: string, PASSWORD: string): Promise<void> {
    try {
      const customer = authenticate(EMAIL, PASSWORD);
      localStorage.setItem('customerID', customer.id);
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

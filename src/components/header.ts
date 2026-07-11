import MenuView from './menu';
import Router from '../services/router/router';
import State from '../services/state';

const createElem = (
  className: string,
  tag: keyof HTMLElementTagNameMap = 'div',
  innerText = ''
): HTMLElement =>
  Object.assign(document.createElement(tag), {
    className,
    innerText
  });

const INNER_HTML = {
  cartItem: `<li class="profile_container-item cart-item">
      <a href="${Router.pages.cart}" class="profile_container-link link profile_container-link--cart">
        <img src="./images/icons/cart-icon.png" alt="cart" class="cart cart-icon" width="56" height="56">
        <span class="cart cart-indicator">0</span>
      </a>
    </li>
    `,
  loggedItem: `<a href="#profile" class="profile_container-link link">
      <img src="./images/avatar.png" alt="profile" class="profile" width="56" height="56"">
    </a>
    <a href="" class="profile_container-logout link">
      <img src="./images/logout_icon.svg" alt="logout" class="logout" width="56" height="56"">
    </a>
    `
};

export default class HeaderView {
  public container: HTMLElement;
  public logoutButton: HTMLElement;
  private menu: MenuView;

  constructor() {
    this.container = createElem('header', 'header');
    this.menu = new MenuView();
    this.renderHeader();
    this.logoutButton = this.container.querySelector('.logout') as HTMLElement;
    if (this.logoutButton) {
      this.logoutButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const target = event.target as HTMLElement;
        if (target.classList.contains('logout')) {
          localStorage.removeItem('customerID');
          localStorage.removeItem('access_token');
          localStorage.removeItem('cartID');
          this.container.innerHTML = '';
          this.container.append(this.menu.render());
          document.querySelector('.logged-item')?.classList.add('hidden');
          document.querySelector('.nav-item_login')?.classList.remove('hidden');
          document
            .querySelector('.nav-item_signup')
            ?.classList.remove('hidden');
        }
      });
    }
  }

  private customerId: string | null = localStorage.getItem('customerID');

  private renderHeader(): void {
    this.container.append(this.menu.render());
    this.container.append(this.headerList());
    window.addEventListener('cart-change', async () => {
      await this.refreshCartCounter();
    });
  }

  public headerList(): HTMLElement {
    const profileContainer = createElem(
      'profile_container profile_container--header list',
      'ul'
    );
    const loggedItemList = createElem(
      'profile_container-item logged-item',
      'li'
    );
    loggedItemList.innerHTML = `${INNER_HTML.loggedItem}`;
    profileContainer.innerHTML = `${INNER_HTML.cartItem}`;
    if (!this.customerId) {
      loggedItemList.classList.add('hidden');
    } else {
      loggedItemList.classList.remove('hidden');
    }
    profileContainer.append(loggedItemList);
    return profileContainer;
  }

  public async refreshCartCounter(): Promise<void> {
    await State.refreshCart();
    const counter = document.querySelector('.cart-indicator') as HTMLElement;
    counter.innerText = State.cart
      ? State.cart?.body.lineItems.length.toString()
      : '0';
  }

  public render(): HTMLElement {
    return this.container;
  }
}

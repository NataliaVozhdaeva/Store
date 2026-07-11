import Router from '../services/router/router';

const INNER_HTML = {
  buttonItem: `<button class="nav-mobile"><span></span><span></span></button>`,
  listItems: `
    <li class="nav-item header-logo logo">
      <a href="#main">
        <img src="./images/Logo.png" alt="logo" class="logo-img" width="37" height="54"/>
        <h4 class="logo-text">Organick</h4>
      </a>
    </li>
    <li class="nav-item">
      <a href="" class="nav-link"></a>
    </li>
    <li class="nav-item"><a href=${Router.pages.main} class="nav-link link">Home</a></li>
    <li class="nav-item"><a href=${Router.pages.about} class="nav-link link">About</a></li>
    <li class="nav-item"><a href=${Router.pages.catalog} class="nav-link link">Catalog</a></li>`,
  loginItem: `<a href=${Router.pages.login} class="nav-link link">Log in</a>`,
  signupItem: `<a href=${Router.pages.signup} class="nav-link link">Sign up</a>`
};

export default class MenuView {
  public container: HTMLElement;

  constructor() {
    this.container = document.createElement('nav');
    this.container.classList.add('navigation');
    this.renderList();
  }

  private customerId: string | null = localStorage.getItem('customerID');

  public renderList(): HTMLElement {
    this.container.innerHTML = `${INNER_HTML.buttonItem}`;
    const navList = document.createElement('ul');
    navList.classList.add('nav', 'nav--header', 'list');
    navList.innerHTML = `${INNER_HTML.listItems}`;
    const loginListItem = document.createElement('li');
    loginListItem.classList.add('nav-item', 'nav-item_login');
    loginListItem.innerHTML = `${INNER_HTML.loginItem}`;
    const signupListItem = document.createElement('li');
    signupListItem.classList.add('nav-item', 'nav-item_signup');
    signupListItem.innerHTML = `${INNER_HTML.signupItem}`;

    if (this.customerId) {
      loginListItem.classList.add('hidden');
      signupListItem.classList.add('hidden');
    } else {
      loginListItem.classList.remove('hidden');
      signupListItem.classList.remove('hidden');
    }
    navList.append(loginListItem, signupListItem);
    this.container.append(navList);
    return navList;
  }

  public render(): HTMLElement {
    return this.container;
  }
}

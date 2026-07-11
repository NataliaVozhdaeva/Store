/* eslint-disable max-lines-per-function */
import Router from '../services/router/router';
import HeaderView from '../components/header';
import FooterView from '../components/footer';
import MainView from './main/main';
import AboutView from './about/about';
import CatalogView from './catalog/catalog';
import LoginView from './login/login';
import SignupView from './signup/signup';
import NotFoundView from './404/404';
import CartView from './cart/cart';
import State from '../services/state';
import ProfileView from './profile/profile';

export default class Layout {
  private header: HeaderView;
  private footer: FooterView;
  private slot: HTMLElement;

  private main: MainView;
  private about: AboutView;
  private catalog: CatalogView;
  private login: LoginView;
  private signup: SignupView;
  private notFound: NotFoundView;
  private cart: CartView;
  private profile: ProfileView;

  constructor() {
    this.header = new HeaderView();
    this.footer = new FooterView();
    this.main = new MainView();
    this.about = new AboutView();
    this.catalog = new CatalogView();
    this.login = new LoginView();
    this.signup = new SignupView();
    this.notFound = new NotFoundView();
    this.cart = new CartView();
    this.profile = new ProfileView();
    this.slot = document.createElement('main');
    this.handleRouteChange();
  }

  private async renderPage(route: string): Promise<void> {
    let pageHTML: string;
    if (route) {
      switch (route) {
        case Router.pages.main: {
          pageHTML = this.main.render;
          break;
        }
        case Router.pages.catalog: {
          pageHTML = '';
          this.slot.innerHTML = '';
          break;
        }
        case Router.pages.login: {
          pageHTML = this.login.render;
          break;
        }
        case Router.pages.signup: {
          pageHTML = this.signup.render;
          break;
        }
        case Router.pages.profile: {
          pageHTML = '';
          if (!localStorage.getItem('customerID')) {
            Router.navigate(Router.pages.main);
            pageHTML = this.main.render;
          }
          break;
        }
        case Router.pages.cart: {
          pageHTML = '';
          this.slot.innerHTML = '';
          break;
        }
        default: {
          if (route.includes('catalog/')) {
            pageHTML = '';
          } else {
            pageHTML = this.notFound.render;
          }
        }
      }
    } else {
      Router.navigate(Router.pages.main);
      pageHTML = this.main.render;
    }
    if (route === Router.pages.catalog) {
      await State.setCatalog(() => {} /* error handling */);
      this.slot.append(this.catalog.render());
    } else if (route === Router.pages.about) {
      this.slot.innerHTML = '';
      this.slot.append(this.about.render());
    } else if (route === Router.pages.profile) {
      this.slot.innerHTML = '';
      this.slot.append(this.profile.render());
    } else if (route.includes('catalog/')) {
      pageHTML = '';
      this.slot.append(this.catalog.render());
      this.slot.append(await this.catalog.renderItemPage(route));
    } else if (route === Router.pages.cart) {
      // await State.refreshCart(() => {} /* error handling */);
      // await State.setCart(() => {} /* error handling */);
      this.slot.append(await this.cart.renderHTML());
    } else {
      this.slot.innerHTML = pageHTML;
    }
  }

  private handleRouteChange(): void {
    window.addEventListener('hashchange', this.routeChange);
  }

  private routeChange = (): void => {
    const { hash } = window.location;
    this.renderPage(hash);
  };

  public render(container: HTMLElement): void {
    container.append(this.header.render());
    this.header.refreshCartCounter();
    container.append(this.slot);
    container.append(this.footer.render());
    this.renderPage(window.location.hash);
  }
}

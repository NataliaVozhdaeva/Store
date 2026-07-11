import Layout from './pages/layout';
import SignUpModal from './pages/signup/sign-up-modal';
import State from './services/state';

export default class App {
  public appContainer = document.querySelector<HTMLElement>('body');
  public menuIcon = this.appContainer?.querySelector('.nav-mobile');
  public nav = this.appContainer?.querySelector('.nav');
  public menuItems = this.appContainer?.querySelectorAll('.nav-item');
  private signUpModal = new SignUpModal();
  private layout = new Layout();

  public async init(): Promise<void> {
    await State.init(
      () => {},
      () => {}
    );
    if (!this.appContainer) throw new Error('error');
    this.layout.render(this.appContainer);

    this.menuIcon =
      this.appContainer?.querySelector<HTMLElement>('.nav-mobile');
    this.nav = this.appContainer?.querySelector<HTMLElement>('.nav');

    this.menuIcon?.addEventListener('click', (): void => this.toggleMenu());

    this.menuItems = this.appContainer?.querySelectorAll('.nav-item');
    this.menuItems.forEach((el) =>
      el.addEventListener('click', (): void => this.toggleMenu())
    );

    window.addEventListener('user-registration-success', (event) => {
      this.signUpModal.show({
        status: (<CustomEvent>event).detail.status,
        firstName: (<CustomEvent>event).detail.firstName,
        lastName: (<CustomEvent>event).detail.lastName
      });
    });

    window.addEventListener('user-registration-fail', (event) => {
      this.signUpModal.show({
        status: (<CustomEvent>event).detail.status,
        email: (<CustomEvent>event).detail.email
      });
    });
  }

  private toggleMenu(): void {
    this.menuIcon?.classList.toggle('clicked');
    this.nav?.classList.toggle('show');
  }
}

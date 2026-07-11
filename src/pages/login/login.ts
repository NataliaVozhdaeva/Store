import { formEmailPsw } from '../signup/signup-form';
import { Customer } from '../../controllers/CustomerControl';

const createCodeTemplate = (): string => {
  const loginFunc = (): void => {
    const email = (document.querySelector('#email') as HTMLInputElement)?.value;
    const psw = (document.querySelector('#psw') as HTMLInputElement)?.value;

    const customer = new Customer();
    customer.loginCustomer(email, psw);
  };

  document.addEventListener('click', (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('login-btn')) {
      loginFunc();
    }
  });

  return `<section class="login">
      <div class="login-wrapper">
        <p class="subtitle subtitle--green login-subtitle">Enter E-mail And Password</p>
        <h3 class="login-title">LogIn</h3>
        <form class="login-form form" id="login">
        ${formEmailPsw}
        </form> 
        <button type="submit" for="login" class="btn login-btn btn--yellow">Let me in</button>
        <div class="login-make-acc">
              <p>Don't have an account? <a href="#signup">Create one now</a></p>
        </div>
      </div>
    </section>`;
};

export default class LoginView {
  public get render(): string {
    return createCodeTemplate();
  }
}

import { formEmailPsw } from '../signup/signup-form';
import { Customer } from '../../controllers/CustomerControl';

const createCodeTemplate = (): string => {
  const loginFunc = (): void => {
    const emailInput = document.querySelector('#email') as HTMLInputElement;
    const pswInput = document.querySelector('#psw') as HTMLInputElement;

    // Логин не должен переиспользовать строгие regex-проверки формата/сложности
    // из формы регистрации — у уже существующего аккаунта пароль мог быть
    // задан раньше и не обязан им соответствовать. Проверяем только, что поля
    // не пустые, остальное (верны ли email/пароль) решает сервер.
    const emailEmpty = !emailInput?.value.trim();
    const pswEmpty = !pswInput?.value.trim();

    const emailError = emailInput?.nextElementSibling as HTMLElement | null;
    const pswError = pswInput?.nextElementSibling as HTMLElement | null;
    if (emailError) emailError.textContent = emailEmpty ? 'Email is required' : '';
    if (pswError) pswError.textContent = pswEmpty ? 'Password is required' : '';
    emailInput?.classList.toggle('error', emailEmpty);
    pswInput?.classList.toggle('error', pswEmpty);

    if (emailEmpty || pswEmpty) return;

    const customer = new Customer();
    customer.loginCustomer(emailInput.value, pswInput.value);
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

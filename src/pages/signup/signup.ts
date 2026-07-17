/* eslint-disable max-lines-per-function */
import SignupTitleView from './signup-title';
import SignupFormView from './signup-form';
import SignUpModal from './sign-up-modal';
import { signupCreate } from '../../services/signupCustomer/signupCustomer';
import { validators } from '../../services/signupCustomer/validationParams';

const createCodeTemplate = (): string => {
  const signupTitleView = new SignupTitleView().render;
  const signupFormView = new SignupFormView().render;
  const signUpModal = new SignUpModal();

  document.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    const targetClass = Array.from(target.classList).find(
      (cls) => cls in validators
    );
    if (targetClass) {
      validators[targetClass](target.value);
    }
    // event.isTrusted: сбрасывать индекс нужно только когда страну меняет
    // сам пользователь, а не когда мы на кнопке "Sign up" рассылаем
    // синтетические input-события для принудительной ревалидации формы
    if (target.classList.contains('country_bill') && event.isTrusted) {
      const postalCodeInput = document.querySelector(
        '.post_bill'
      ) as HTMLInputElement;
      if (postalCodeInput) {
        postalCodeInput.value = '';
      }
    }
    if (target.classList.contains('country_ship') && event.isTrusted) {
      const postalCodeInput = document.querySelector(
        '.post_ship'
      ) as HTMLInputElement;
      if (postalCodeInput) {
        postalCodeInput.value = '';
      }
    }
  });

  document.addEventListener('click', async (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    event.stopImmediatePropagation();
    if (target && target.classList.contains('form-button')) {
      // Ограничиваем проверку полями формы регистрации и принудительно
      // валидируем даже те поля, в которые пользователь ни разу не вводил
      // текст (иначе они остаются "чистыми" и форма уходит на сервер пустой)
      const formContainer = document.querySelector('.form-container');
      const inputElements = formContainer
        ? Array.from(formContainer.querySelectorAll('input')).filter(
            (input) => input.type !== 'checkbox' && !input.closest('.hidden')
          )
        : [];

      inputElements.forEach((input) =>
        input.dispatchEvent(new Event('input', { bubbles: true }))
      );

      const hasError = inputElements.some((input) =>
        input.classList.contains('error')
      );

      if (hasError) {
        signUpModal.show({ status: 'form error' });
      } else {
        await signupCreate();
      }
    }

    const targetHideShow = event.target as HTMLElement;
    if (
      targetHideShow &&
      targetHideShow.classList.contains('form-psw_toggle')
    ) {
      const passwordInput = document.querySelector(
        '.form-psw_input'
      ) as HTMLInputElement;
      const type = passwordInput.getAttribute('type');
      if (type === 'password') {
        passwordInput.setAttribute('type', 'text');
        targetHideShow.innerHTML = '&#9899;';
      } else {
        passwordInput.setAttribute('type', 'password');
        targetHideShow.innerHTML = '&#9898;';
      }
    }
  });

  document.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    const shipAddress = document.querySelector(
      '.form-shipping-address'
    ) as HTMLElement;
    const shipTitle = document.querySelector(
      '.form-shipping_title'
    ) as HTMLElement;
    if (target && target.classList.contains('copy_address')) {
      if (target.checked) {
        shipAddress.classList.add('hidden');
        shipTitle.classList.add('hidden');
      } else {
        shipAddress.classList.remove('hidden');
        shipTitle.classList.remove('hidden');
      }
    }
  });

  return `${signupTitleView}${signUpModal.render()}${signupFormView}`;
};

export default class SignupView {
  public get render(): string {
    return createCodeTemplate();
  }
}

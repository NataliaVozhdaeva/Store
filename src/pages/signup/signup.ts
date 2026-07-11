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
    if (target.classList.contains('country_bill')) {
      const postalCodeInput = document.querySelector(
        '.post_bill'
      ) as HTMLInputElement;
      if (postalCodeInput) {
        postalCodeInput.value = '';
      }
    }
    if (target.classList.contains('country_ship')) {
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
      const inputElements = document.querySelectorAll('input');
      const inputElemsCopiedAddr = document.querySelectorAll(
        '.input-copy'
      ) as NodeListOf<HTMLInputElement>;
      let hasError = false;
      let allInputsEmpty = true;
      let isEmpty = false;
      inputElements.forEach((input) => {
        if (input.classList.contains('error')) {
          hasError = true;
        }
        if (input.value !== '') {
          allInputsEmpty = false;
        }
      });
      inputElemsCopiedAddr.forEach((inputCopy) => {
        if (inputCopy.value === '') {
          isEmpty = true;
        }
      });
      if (hasError || allInputsEmpty) {
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

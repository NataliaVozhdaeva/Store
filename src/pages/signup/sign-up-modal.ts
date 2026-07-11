/* eslint-disable max-lines-per-function */
import Router from '../../services/router/router';

type ModalStatusType = 'success' | 'user exists' | 'form error';
type ModalArgsType = {
  status: ModalStatusType;
  firstName?: string;
  lastName?: string;
  email?: string;
};

export default class SignUpModal {
  public show({ status, firstName, lastName, email }: ModalArgsType): void {
    const container = document.querySelector(
      '.sign-up-modal'
    ) as HTMLDialogElement;
    container.innerHTML = '';
    switch (status) {
      case 'user exists': {
        container.innerHTML = `
                                    <div class="modal-fail-img"></div>
                                    <h3 class="modal-message">Sorry. User with e-mail <br> ${email} <br> already exists!</h3>
                                    `;
        break;
      }
      case 'form error': {
        container.innerHTML = `
                                    <div class="modal-fail-img"></div>
                                    <h3 class="modal-message">Sorry. <br> Check if the form is filled out correctly!</h3>
                                    `;
        break;
      }

      default: {
        container.innerHTML = `
                                  <div class="modal-succes-img"></div>
                                  <h3 class="modal-message">User <br> ${firstName} ${lastName} <br> succesfully registered!</h3>
                                  `;
      }
    }
    container.showModal();
    document.body.style.overflow = 'hidden';
    container.addEventListener(
      'click',
      () => {
        this.hide();
        if (status === 'success') {
          Router.navigate('#main');
        }
      },
      { once: true }
    );
  }

  public hide(): void {
    const container = document.querySelector(
      '.sign-up-modal'
    ) as HTMLDialogElement;
    container.innerHTML = '';
    container.close();
    document.body.style.overflow = 'auto';
  }

  public render(): string {
    return `<dialog class="sign-up-modal"></dialog> `;
  }
}

/* eslint-disable max-lines-per-function */
import { Customer } from '@commercetools/platform-sdk';
import {
  ChangePassword,
  EditCustomerById,
  QueryCustomerById
} from '../../api/apiMethods';
import Component from '../../components/abstract/component';
import Address from './address';
import PersonalInfo from './personalInfo';

const MODAL_CHANGE_INFO = `
  <h3>Edit Profile</h3>
  <div class="dialog-edit-info">
    <label for="input-first-name">First Name:</label>
    <input type="text" id="input-first-name">
    <label for="input-last-name">Last Name:</label>
    <input type="text" id="input-last-name">
    <label for="input-dob">Date of Birth:</label>
    <input type="text" id="input-dob">
    <label for="input-email">Email:</label>
    <input type="text" id="input-email">
  </div>
  <button id="save-btn">Save</button>
  <button id="cancel-btn">Cancel</button>
  `;

const MODAL_CHANGE_PASS = `
  <h3>Change password</h3>
  <div class="dialog-change-pass">
    <label for="input-pass-old">Current password:</label>
    <input type="password" id="input-pass-old">
    <label for="input-pass-new">New password:</label>
    <input type="password" id="input-pass-new">
  </div>
  <button id="save-btn">Save</button>
  <button id="cancel-btn">Cancel</button>
`;

export default class ProfileView extends Component {
  private errorModal: HTMLDialogElement;
  private editModal!: HTMLDialogElement;
  private changePassModal!: HTMLDialogElement;
  private inputFirstName!: HTMLInputElement;
  private inputLastName!: HTMLInputElement;
  private inputDOB!: HTMLInputElement;
  private inputEmail!: HTMLInputElement;
  private inputPassOld!: HTMLInputElement;
  private inputPassNew!: HTMLInputElement;
  public customerId: string | null;

  constructor() {
    super();
    this.customerId = localStorage.getItem('customerID');
    this.container.classList.add('profile');
    this.errorModal = document.createElement('dialog');
    this.renderHeading();
    this.refreshProfile();
    this.container.append(this.errorModal);
    this.errorModal.addEventListener('click', () => {
      this.errorModal.close();
    });
    this.setupEditModal();
    this.setupChangePassModal();
    this.render();
  }

  private setupEditModal(): void {
    this.editModal = document.createElement('dialog');
    this.editModal.innerHTML = MODAL_CHANGE_INFO;
    this.container.append(this.editModal);

    this.inputFirstName = this.editModal.querySelector(
      '#input-first-name'
    ) as HTMLInputElement;
    this.inputLastName = this.editModal.querySelector(
      '#input-last-name'
    ) as HTMLInputElement;
    this.inputDOB = this.editModal.querySelector(
      '#input-dob'
    ) as HTMLInputElement;
    this.inputEmail = this.editModal.querySelector(
      '#input-email'
    ) as HTMLInputElement;
    const saveBtn = this.editModal.querySelector('#save-btn');
    const cancelBtn = this.editModal.querySelector('#cancel-btn');

    saveBtn?.addEventListener('click', () => this.handleEditSave());
    cancelBtn?.addEventListener('click', () => this.editModal.close());
  }

  private handleEditSave(): void {
    if (this.customerId) {
      this.getCurrentVersion(this.customerId)
        .then((version) => {
          this.editProfile(
            this.inputFirstName.value,
            this.inputLastName.value,
            this.inputDOB.value,
            this.inputEmail.value,
            version
          );
        })
        .catch((error) => {
          console.error('Error getting current version:', error);
          // this.errorModal.innerText = error;
          // this.errorModal.showModal();
        });
    }
    this.editModal.close();
  }

  public openEditModal(content: Customer): void {
    this.inputFirstName.value = content.firstName || '';
    this.inputLastName.value = content.lastName || '';
    this.inputDOB.value = content.dateOfBirth || '';
    this.inputEmail.value = content.email || '';
    this.editModal.showModal();
  }

  public openChangePassModal(): void {
    this.inputPassOld.value = '';
    this.inputPassNew.value = '';
    this.changePassModal.showModal();
  }

  private setupChangePassModal(): void {
    this.changePassModal = document.createElement('dialog');
    this.changePassModal.innerHTML = MODAL_CHANGE_PASS;
    this.container.append(this.changePassModal);

    this.inputPassOld = this.changePassModal.querySelector(
      '#input-pass-old'
    ) as HTMLInputElement;
    this.inputPassNew = this.changePassModal.querySelector(
      '#input-pass-new'
    ) as HTMLInputElement;
    const saveBtn = this.changePassModal.querySelector('#save-btn');
    const cancelBtn = this.changePassModal.querySelector('#cancel-btn');

    saveBtn?.addEventListener('click', () => this.handleChangePassSave());
    cancelBtn?.addEventListener('click', () => this.changePassModal.close());
  }

  private handleChangePassSave(): void {
    if (this.customerId) {
      this.getCurrentVersion(this.customerId)
        .then((version) => {
          this.changePass(
            this.inputPassOld.value,
            this.inputPassNew.value,
            version
          );
        })
        .catch((error) => {
          console.error('Error getting current version:', error);
          // this.errorModal.innerText = error;
          // this.errorModal.showModal();
        });
    }
    this.changePassModal.close();
  }

  public renderHeading(): void {
    const profileWrapper = document.createElement('div');
    profileWrapper.classList.add('profile-title_wrapper');
    const profileBg = document.createElement('div');
    profileBg.classList.add('profile-background-image');
    const profileTitle = document.createElement('h1');
    profileTitle.classList.add('profile-title');
    profileTitle.innerText = 'Your profile';
    profileWrapper.appendChild(profileBg);
    profileBg.appendChild(profileTitle);
    this.container.appendChild(profileWrapper);
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      this.btnHandling(target);
    });
  }

  public btnHandling(target: HTMLElement): void {
    if (target && target.classList.contains('info-edit-btn')) {
      if (this.customerId) {
        QueryCustomerById(this.customerId)
          .then(({ body }) => {
            this.openEditModal(body);
          })
          .catch((error) => {
            console.error('Something went wrong:', error);
            // this.errorModal.innerText = error;
            // this.errorModal.showModal();
          });
      }
    } else if (target && target.classList.contains('change-pass-btn')) {
      this.openChangePassModal();
    }
  }

  public async refreshProfile(): Promise<void> {
    if (this.customerId) {
      try {
        const { body } = await QueryCustomerById(this.customerId);
        this.renderProfileInfo(body);
        this.renderAddresses(body);
      } catch (error) {
        this.errorModal.innerText = 'Something went wrong, try again';
        // this.errorModal.showModal();
        console.error('Something went wrong:', error);
      }
    }
  }

  private renderProfileInfo(content: Customer): void {
    const profileInfo = new PersonalInfo(
      content.id,
      content.firstName,
      content.lastName,
      content.dateOfBirth,
      content.email
    ).render();
    this.container.append(profileInfo);
  }

  private renderAddresses(content: Customer): void {
    const addressInfo = document.createElement('div');
    addressInfo.className = 'addresses-container';
    content.addresses.forEach(
      (addressData) =>
        addressData.id &&
        addressInfo.appendChild(
          new Address(
            addressData.id,
            addressData.streetName,
            addressData.streetNumber,
            addressData.city,
            addressData.state,
            addressData.country,
            addressData.postalCode,
            content.defaultShippingAddressId === addressData.id,
            content.defaultBillingAddressId === addressData.id,
            content.shippingAddressIds?.includes(addressData.id) || false,
            content.billingAddressIds?.includes(addressData.id) || false
          ).render()
        )
    );
    this.container.append(addressInfo);
  }

  public getCurrentVersion(CUSTOMER_ID: string): Promise<number> {
    return QueryCustomerById(CUSTOMER_ID)
      .then(({ body }) => {
        return body.version;
      })
      .catch((error) => {
        console.error('Something went wrong:', error);
        // this.errorModal.innerText = error;
        // this.errorModal.showModal();
      });
  }

  public editProfile(
    FIRST_NAME: string,
    LAST_NAME: string,
    DATE_OF_BIRTH: string,
    EMAIL: string,
    VERSION: number
  ): void {
    if (this.customerId) {
      EditCustomerById(
        this.customerId,
        FIRST_NAME,
        LAST_NAME,
        DATE_OF_BIRTH,
        EMAIL,
        VERSION
      )
        .then(({ body }) => {
          const profileContainer = document.querySelector(
            '.profile-container'
          ) as HTMLElement;
          profileContainer.remove();
          const addressesContainer = document.querySelector(
            '.addresses-container'
          ) as HTMLElement;
          addressesContainer.remove();
          this.errorModal.innerText = 'Your data has been successfully changed';
          this.errorModal.showModal();
          this.refreshProfile();
        })
        .catch((error) => {
          console.error('Something went wrong:', error);
          // this.errorModal.innerText = error;
          // this.errorModal.showModal();
        });
    }
  }

  public changePass(PASS_OLD: string, PASS_NEW: string, VERSION: number): void {
    if (this.customerId) {
      ChangePassword(this.customerId, PASS_OLD, PASS_NEW, VERSION)
        .then(({ body }) => {
          this.errorModal.innerText =
            'Your password has been successfully changed';
          this.errorModal.showModal();
        })
        .catch((error) => {
          console.error('Something went wrong:', error);
          // this.errorModal.innerText = error;
          // this.errorModal.showModal();
        });
    }
  }

  public render(): HTMLElement {
    return this.container;
  }
}

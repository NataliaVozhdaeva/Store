/* eslint-disable max-lines-per-function */
/* eslint-disable no-restricted-syntax */
import { EditAddressById, QueryCustomerById } from '../../api/apiMethods';
import InfoElem from './profileElem';

const createElem = (tag: string, className: string): HTMLElement =>
  Object.assign(document.createElement(tag), { className });

const MODAL_CHANGE_ADDRESS = `
  <h3>Edit Address</h3>
  <div class="dialog-edit-address">
    <label for="input-street-name">Street Name:</label>
    <input type="text" id="input-street-name">
    <label for="input-city">City:</label>
    <input type="text" id="input-city">
    <label for="input-state">State:</label>
    <input type="text" id="input-state">
    <label for="input-country">Country:</label>
    <input type="text" id="input-country">
    <label for="input-postal-code">Postal Code:</label>
    <input type="text" id="input-postal-code">
    </div>
  <button id="save-btn">Save</button>
  <button id="cancel-btn">Cancel</button>
  `;

export default class Address {
  private errorModal: HTMLDialogElement;
  private editModal!: HTMLDialogElement;
  public id: string;
  public streetName: string | undefined;
  public streetNumber: string | undefined;
  public city: string | undefined;
  public state: string | undefined;
  public country: string | undefined;
  public postalCode: string | undefined;
  public isDefaultShipping: boolean;
  public isDefaultBilling: boolean;
  public isShippingAddress: boolean;
  public isBillingAddress: boolean;
  private container: HTMLElement;
  private inputStreetName!: HTMLInputElement;
  private inputCity!: HTMLInputElement;
  private inputState!: HTMLInputElement;
  private inputCountry!: HTMLInputElement;
  private inputPostalCode!: HTMLInputElement;

  constructor(
    id: string,
    streetName: string | undefined,
    streetNumber: string | undefined,
    city: string | undefined,
    state: string | undefined,
    country: string | undefined,
    postalCode: string | undefined,
    isDefaultShipping: boolean,
    isDefaultBilling: boolean,
    isShippingAddress: boolean,
    isBillingAddress: boolean
  ) {
    this.id = id;
    this.streetName = streetName;
    this.streetNumber = streetNumber;
    this.city = city;
    this.state = state;
    this.country = country;
    this.postalCode = postalCode;
    this.isDefaultShipping = isDefaultShipping;
    this.isDefaultBilling = isDefaultBilling;
    this.isShippingAddress = isShippingAddress;
    this.isBillingAddress = isBillingAddress;
    this.container = document.createElement('div');
    this.container.className = 'address';
    this.errorModal = document.createElement('dialog');
    this.container.append(this.errorModal);
    this.errorModal.addEventListener('click', () => {
      this.errorModal.close();
    });
    this.createAddressElem();
    this.setupEditModal();
  }

  private customerId: string | null = localStorage.getItem('customerID');

  public createAddressElem(): void {
    const addressItem = createElem('div', 'address-item');
    const adrTitle = createElem('div', 'address-title');
    if (this.isBillingAddress) {
      adrTitle.classList.add('adr-billing');
    }
    if (this.isShippingAddress) {
      adrTitle.classList.add('adr-shipping');
    }
    if (this.isDefaultBilling) {
      adrTitle.classList.add('adr-billing_default');
    }
    if (this.isDefaultShipping) {
      adrTitle.classList.add('adr-shipping_default');
    }
    adrTitle.innerHTML = 'Address:';
    const adrStreet = new InfoElem(
      'address-street',
      'Street:',
      `${this.streetName} ${this.streetNumber ? this.streetNumber : ''}`
    ).render();
    const adrCity = new InfoElem(
      'address-city',
      'City:',
      `${this.city}`
    ).render();
    const adrState = new InfoElem(
      'address-state',
      'State:',
      `${this.state ? this.state : '-'}`
    ).render();
    const adrCountry = new InfoElem(
      'address-country',
      'Country:',
      `${this.country}`
    ).render();
    const adrPostalCode = new InfoElem(
      'address-post',
      'Postal Code:',
      `${this.postalCode}`
    ).render();
    const { classList } = adrTitle;
    for (const className of classList) {
      if (className.startsWith('adr-')) {
        const label = document.createElement('div');
        label.textContent = className.replace('adr-', '').replace('_', ' ');
        adrTitle.appendChild(label);
      }
    }
    const editBtns = createElem('div', 'edit-btns');
    const editBtn = createElem('button', 'address-edit-btn');
    editBtn.classList.add('btn', 'btn--blue');
    editBtn.innerHTML = 'Edit';
    const deleteBtn = createElem('button', 'address-delete-btn');
    deleteBtn.classList.add('btn', 'btn--blue');
    deleteBtn.innerHTML = 'Delete';
    editBtns.append(editBtn, deleteBtn);
    addressItem.append(
      adrTitle,
      adrStreet,
      adrCity,
      adrState,
      adrCountry,
      adrPostalCode,
      editBtns
    );
    this.container.append(addressItem);
    editBtn.addEventListener('click', () => {
      this.btnEditHandling();
    });
  }

  public btnEditHandling(): void {
    if (this.customerId) {
      QueryCustomerById(this.customerId)
        .then(({ body }) => {
          const data = body.addresses;
          const targetAddress = data.find(
            (item: { id: string }) => item.id === this.id
          );
          this.openEditModal(targetAddress);
        })
        .catch((error) => {
          this.errorModal.innerText =
            'The address does not contain correct data';
          this.errorModal.showModal();
        });
    }
  }

  private setupEditModal(): void {
    this.editModal = document.createElement('dialog');
    this.editModal.innerHTML = MODAL_CHANGE_ADDRESS;
    this.container.append(this.editModal);

    this.inputStreetName = this.editModal.querySelector(
      '#input-street-name'
    ) as HTMLInputElement;
    this.inputCity = this.editModal.querySelector(
      '#input-city'
    ) as HTMLInputElement;
    this.inputState = this.editModal.querySelector(
      '#input-state'
    ) as HTMLInputElement;
    this.inputCountry = this.editModal.querySelector(
      '#input-country'
    ) as HTMLInputElement;
    this.inputPostalCode = this.editModal.querySelector(
      '#input-postal-code'
    ) as HTMLInputElement;
    const saveBtn = this.editModal.querySelector('#save-btn');
    const cancelBtn = this.editModal.querySelector('#cancel-btn');

    saveBtn?.addEventListener('click', () => this.handleEditSave());
    cancelBtn?.addEventListener('click', () => this.editModal.close());
  }

  public getCurrentVersion(CUSTOMER_ID: string): Promise<number> {
    return QueryCustomerById(CUSTOMER_ID)
      .then(({ body }) => {
        return body.version;
      })
      .catch((error) => {
        this.errorModal.innerText = error;
        this.errorModal.showModal();
      });
  }

  public editAddress(
    STREET_NAME: string,
    CITY: string,
    STATE: string,
    COUNTRY: string,
    POSTAL_CODE: string,
    VERSION: number
  ): void {
    if (this.customerId) {
      EditAddressById(
        this.customerId,
        this.id,
        STREET_NAME,
        CITY,
        STATE,
        COUNTRY,
        POSTAL_CODE,
        VERSION
      )
        .then(({ body }) => {
          this.errorModal.innerText = 'Your data has been successfully changed';
          this.errorModal.showModal();
          window.location.reload();
        })
        .catch((error) => {
          this.errorModal.innerText =
            'The address does not contain correct data';
          this.errorModal.showModal();
        });
    }
  }

  private handleEditSave(): void {
    if (this.customerId) {
      this.getCurrentVersion(this.customerId)
        .then((version) => {
          this.editAddress(
            this.inputStreetName.value,
            this.inputCity.value,
            this.inputState.value,
            this.inputCountry.value,
            this.inputPostalCode.value,
            version
          );
        })
        .catch((error) => {
          this.errorModal.innerText =
            'Shomething went wrong, try one more time';
          this.errorModal.showModal();
        });
    }
    this.editModal.close();
  }

  public openEditModal(addresses: Address): void {
    this.inputStreetName.value = addresses.streetName || '';
    this.inputCity.value = addresses.city || '';
    this.inputState.value = addresses.state || '';
    this.inputCountry.value = addresses.country || '';
    this.inputPostalCode.value = addresses.postalCode || '';
    this.editModal.showModal();
  }

  public render(): HTMLElement {
    return this.container;
  }
}

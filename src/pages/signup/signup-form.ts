import { signupCreate } from '../../services/signupCustomer/signupCustomer';

const formEmailPsw = `
  <div class="form-email-psw">
    <div class="form-email">
      <label class="form-email_label" for="email">E-mail*</label>
      <input class="form-email_input email input-copy" type="text" id="email" name="email" minlength="5" required></input>
      <div class="error-message" id="emailError"></div>
    </div>
    <div class="form-psw">
      <label class="form-psw_label" for="psw">Password*</label>
      <span class="form-psw_toggle">&#9898;</span>
      <input class="form-psw_input psw input-copy" type="password" id="psw" name="psw" minlength="8" required></input>
      <div class="error-message"></div>
    </div>
  </div>
`;

const formNameDob = `
  <div class="form-name-dob">
    <div class="form-name">
      <label class="form-first-name_label" for="first-name">First name*</label>
      <input class="form-first-name_input first-name input-copy" type="text" id="first-name" name="first-name" minlength="1" required></input>
      <div class="error-message"></div>
      <label class="form-last-name_label" for="last-name">Last name*</label>
      <input class="form-last-name_input last-name input-copy" type="text" id="last-name" name="last-name" minlength="1" required></input>
      <div class="error-message"></div>
    </div>
    <div class="form-dob">
      <label class="form-dob_label" for="dob">Date of birth*</label>
      <input class="form-dob_input dob input-copy" type="date" id="dob" name="dob" required></input>
      <div class="error-message"></div>
    </div>
  </div>
`;

export const countriesList = `
  <option value='BELARUS'>BELARUS</option>
  <option value='GERMANY'>GERMANY</option>
`;

const formBillingAddress = `
  <h5 class="form-billing_title">Billing Address</h5>
  <div class="form-billing-address">
    <div class="form-country">
      <label class="form-country_label for="country"">Country*</label>
      <input class="form-country_input country_bill country input-copy" type="text" id="country_bill" name="country" list="countries_bill" required></input>
      <div class="error-message"></div>
      <datalist id="countries_bill">${countriesList}</datalist>
    </div>
    <div class="form-post">
      <label class="form-postalCode_label" for="postalCode">Postal code*</label>
      <input class="form-postalCode_input post_bill postal-code input-copy" type="text" id="postalCode" name="postalCode" required></input>
      <div class="error-message"></div>
    </div>
    <div class="form-city">
      <label class="form-city_label" for="city">City*</label>
      <input class="form-city_input city_bill city input-copy" type="text" id="city" name="city" minlength="1" required></input>
      <div class="error-message"></div>
    </div>
    <div class="form-street">
      <label class="form-street_label" for="street">Street*</label>
      <input class="form-street_input street_bill street input-copy" type="text" id="street" name="street" minlength="1" required></input>
      <div class="error-message"></div>
    </div>
    <div class="form-default_checkbox">
      <input class="form-default_input bill_default" type="checkbox" id="setDefaultBilling" name="setDefaultBilling">
      <label class="form-default_label" for="setDefaultBilling">Set deafult</label>
    </div>
    <div class="form-copy-addr_checkbox">
      <input class="form-copy-addr_input copy_address" type="checkbox" id="copy_address" name="copy_address">
      <label class="form-copy-addr_label" for="copy_address">Copy to Shipping address</label>
    </div>
  </div>
`;

const formShippinAddress = `
  <h5 class="form-shipping_title">Shipping Address</h5>
  <div class="form-shipping-address">
    <div class="form-country">
      <label class="form-country_label for="country"">Country*</label>
      <input class="form-country_input country_ship country" type="text" id="country_ship" name="country" list="countries_ship" required></input>
      <div class="error-message"></div>
      <datalist id="countries_ship">${countriesList}</datalist>
    </div>
    <div class="form-post">
      <label class="form-postalCode_label" for="postalCode">Postal code*</label>
      <input class="form-postalCode_input post_ship postal-code" type="text" id="postalCode" name="postalCode" required></input>
      <div class="error-message"></div>
    </div>
    <div class="form-city">
      <label class="form-city_label" for="city">City*</label>
      <input class="form-city_input city_ship city" type="text" id="city" name="city" minlength="1" required></input>
      <div class="error-message"></div>
    </div>
    <div class="form-street">
      <label class="form-street_label" for="street">Street*</label>
      <input class="form-street_input street_ship street" type="text" id="street" name="street" minlength="1" required></input>
      <div class="error-message"></div>
    </div>
    <div class="form-default_checkbox">
      <input class="form-default_input ship_default" type="checkbox" id="setDefaultShipping" name="setDefaultShipping">
      <label class="form-default_label" for="setDefaultShipping">Set deafult</label>
    </div>
  </div>
`;

const modalWindow = `
  <div id="errorModal" class="modal">
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <p class="modal-text">One or more sign up fields are not filled in correctly.</p>
    </div>
  </div>
`;

const hasLogin = `
  <p>Already have an account? Log in <a href="#login">here</a></p>
`;

const createCodeTemplate = (): string => {
  return `
  <section class="form form-container">
    <div class="form-content_wrapper">
      ${formEmailPsw}
      ${formNameDob}
      <div class="form-addresses">
        ${formBillingAddress}
        ${formShippinAddress}
      </div>
      <button class="form-button btn btn--yellow " id="form-button">Sign up</button>
      ${modalWindow}
      <div class="form-has-login">${hasLogin}</div>
    </div>
  </section>
  `;
};

export default class SignupFormView {
  public get render(): string {
    return createCodeTemplate();
  }
}

export { formEmailPsw };

import { countries } from './countries';
import InputValidator from './inputValidator';

function createInputValidator(
  className: string,
  validationFunction: (input: string) => boolean,
  errorMessage: string
): InputValidator {
  return new InputValidator(className, validationFunction, errorMessage);
}

function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

function isValidPassword(password: string): boolean {
  const pswPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=\S+$).{8,}$/;
  return pswPattern.test(password);
}

function isValidText(text: string): boolean {
  const textPattern = /^[a-zA-Z ]+$/;
  return textPattern.test(text);
}

function isValidCity(city: string): boolean {
  const cityPattern =
    /^(?=.*[a-zA-Z])[a-zA-Z0-9\s!@#$%^&*()-_+=<>?/|{}[\]`~]*$/;
  return cityPattern.test(city);
}

function isValidDob(dob: string): boolean {
  const inputDate = new Date(dob);
  const currentDate = new Date();
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 13);
  return inputDate <= currentDate && inputDate <= minDate;
}

function isValidCountry(inputCountry: string): boolean {
  const input = inputCountry.trim().toUpperCase();
  const matchingCountry = countries.find((country) => country.name === input);
  if (matchingCountry) {
    return true;
  }
  return false;
}

function isValidPostalCodeBill(code: string): boolean {
  const country = (document.querySelector('.country_bill') as HTMLInputElement)
    ?.value;
  const countryData = countries.find((item) => item.name === country);
  if (countryData && countryData.postalCode.test(code)) {
    return true;
  }
  return false;
}

function isValidPostalCodeShip(code: string): boolean {
  const country = (document.querySelector('.country_ship') as HTMLInputElement)
    ?.value;
  const countryData = countries.find((item) => item.name === country);
  if (countryData && countryData.postalCode.test(code)) {
    return true;
  }
  return false;
}

const emailValidator = createInputValidator(
  'email',
  isValidEmail,
  'Please enter a properly formatted email address (e.g., user@example.com) in Latin, whitespaces are not allowed'
);

const passwordValidator = createInputValidator(
  'psw',
  isValidPassword,
  'Password must contain minimum 8 Latin characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number, whitespaces are not allowed'
);

const firstNameValidator = createInputValidator(
  'first-name',
  isValidText,
  'First name must contain at least one Latin character and no special characters or numbers'
);

const lastNameValidator = createInputValidator(
  'last-name',
  isValidText,
  'Last name must contain at least one Latin character and no special characters or numbers'
);

const dobValidator = createInputValidator(
  'dob',
  isValidDob,
  'You should be 13 years old or older'
);

const streetValidator = createInputValidator(
  'street',
  isValidText,
  'Street must contain at least one Latin character and no special characters or numbers'
);

const cityValidator = createInputValidator(
  'city',
  isValidCity,
  'City must contain at least one Latin character'
);

const postalCodeBillValidator = createInputValidator(
  'post_bill',
  isValidPostalCodeBill,
  'The Postal code format does not correspond to the submitted country'
);

const postalCodeShipValidator = createInputValidator(
  'post_ship',
  isValidPostalCodeShip,
  'The Postal code format does not correspond to the submitted country'
);

const countyValidator = createInputValidator(
  'country',
  isValidCountry,
  'Country must be chosen from the given list'
);

export const validators: Record<string, (input: string) => boolean> = {
  email: isValidEmail,
  psw: isValidPassword,
  'first-name': isValidText,
  'last-name': isValidText,
  dob: isValidDob,
  street: isValidText,
  city: isValidCity,
  country: isValidCountry,
  post_bill: isValidPostalCodeBill,
  post_ship: isValidPostalCodeShip
};

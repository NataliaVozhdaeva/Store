/**
 * @jest-environment jsdom
 */

import { validators } from '../services/signupCustomer/validationParams';
import { countriesList } from '../pages/signup/signup-form';

const countryNames = countriesList.split("'").filter((item, i) => i % 2);

test('E-mail validation test', () => {
  expect(validators.email('mail@gmail.com')).toBe(true);
  expect(validators.email('wwwww@www.www')).toBe(true);
  expect(validators.email('1@gmail.com')).toBe(true);
  expect(validators.email('mail@tut.com')).toBe(true);
  expect(validators.email('почта@gmail.com')).toBe(true);
  expect(validators.email(' @gmail.c')).toBe(false);
  expect(validators.email('weeeee@gmail.c')).toBe(false);
  expect(validators.email('')).toBe(false);
  expect(validators.email('1')).toBe(false);
  expect(validators.email('true')).toBe(false);
  expect(validators.email('@gmail.com')).toBe(false);
  expect(validators.email('gmail.com')).toBe(false);
});

test('Password validation test', () => {
  expect(validators.psw('RSSChool2023')).toBe(true);
  expect(validators.psw('FrontEnd-Stage3')).toBe(true);
  expect(validators.psw('FrontEndStage3?')).toBe(true);

  expect(validators.psw('')).toBe(false);
  expect(validators.psw(' ')).toBe(false);
  expect(validators.psw('1')).toBe(false);
  expect(validators.psw('!')).toBe(false);
  expect(validators.psw('!1')).toBe(false);
  expect(validators.psw('Front23')).toBe(false);
  expect(validators.psw('FrontFront')).toBe(false);
  expect(validators.psw('frontfront')).toBe(false);
  expect(validators.psw('frontfront2023')).toBe(false);
  expect(validators.psw('frontfront2023!')).toBe(false);
  expect(validators.psw('FrontEnd Stage3')).toBe(false);
  expect(validators.psw('Пароль@')).toBe(false);
});

test('Text validation test', () => {
  expect(validators['last-name']('rsschool')).toBe(true);
  expect(validators['last-name']('R')).toBe(true);
  expect(validators['last-name'](' ')).toBe(true); /* shuld be? */
  expect(validators['last-name']('RS School')).toBe(true);
  expect(validators['last-name']('')).toBe(false);
  expect(validators['last-name']('|')).toBe(false);
  expect(validators['last-name']('22')).toBe(false);
  expect(validators['last-name']('?error')).toBe(false);
  expect(validators['last-name']('2error')).toBe(false);
});

test('City validation test', () => {
  expect(validators.city('Gomel')).toBe(true);
  expect(validators.city('gomel')).toBe(true);
  expect(validators.city('Gomel2023')).toBe(true);
  expect(validators.city('Gomel+')).toBe(true);
  expect(validators.city('Gomel+2023')).toBe(true);
  expect(validators.city('G')).toBe(true);

  expect(validators.city(' ')).toBe(false);
  expect(validators.city('2023')).toBe(false);
  expect(validators.city('/')).toBe(false);
  expect(validators.city('/1}&*_))')).toBe(false);
  expect(validators.city('1')).toBe(false);
  expect(validators.city('')).toBe(false);
});

// eslint-disable-next-line max-lines-per-function
test('Date of birth validation test', () => {
  expect(validators.dob('1111-11-11')).toBe(true);
  expect(
    validators.dob(
      new Date(
        `${
          new Date().getFullYear() - 13
        }-${new Date().getMonth()}-${new Date().getDate()}`
      ).toString()
    )
  ).toBe(true);
  expect(
    validators.dob(
      new Date(
        `${
          new Date().getFullYear() - 13
        }:${new Date().getMonth()}:${new Date().getDate()}`
      ).toString()
    )
  ).toBe(true);

  expect(validators.dob(new Date().toString())).toBe(false);
  expect(validators.dob('2021-11-11')).toBe(false);
  expect(
    validators.dob(
      new Date(
        `${
          new Date().getFullYear() - 12
        }-${new Date().getMonth()}-${new Date().getDate()}`
      ).toString()
    )
  ).toBe(false);
  expect(
    validators.dob(
      new Date(
        `${
          new Date().getFullYear() - 12
        }:${new Date().getMonth()}:${new Date().getDate()}`
      ).toString()
    )
  ).toBe(false);
});

test('Country validation test', () => {
  countryNames.forEach((name) => {
    expect(validators.country(name)).toBe(true);
  });
});

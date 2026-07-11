/**
 * @jest-environment jsdom
 */

import Router from '../services/router/router';

test('Navigation test', () => {
  Router.navigate(Router.pages.main);
  expect(window.location.hash).toBe('#main');
  Router.navigate(Router.pages.about);
  expect(window.location.hash).toBe('#about');
  Router.navigate(Router.pages.catalog);
  expect(window.location.hash).toBe('#catalog');
  Router.navigate(Router.pages.login);
  expect(window.location.hash).toBe('#login');
  Router.navigate(Router.pages.notFound);
  expect(window.location.hash).toBe('#404');
  Router.navigate('');
  expect(window.location.hash).toBe('');
});

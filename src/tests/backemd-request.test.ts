/**
 * @jest-environment jsdom
 */

import {
  GetCart,
  GetProductsPublished,
  getProductCategories
} from '../api/apiMethods';

test('products published', async () => {
  const products = await GetProductsPublished();
  expect(products).not.toBeNull();
  expect(products).toBeDefined();
  expect(products.body).not.toBeFalsy();
  expect(products.body.results).not.toBeFalsy();
  expect(products.body.results).toBeInstanceOf(Array);
  products.body.results.forEach((result) => {
    expect(result.id).not.toBeNull();
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    expect(result.masterVariant).not.toBeNull();
    expect(result.masterVariant).toBeDefined();
    expect(result.masterVariant.id).toBeDefined();
    expect(typeof result.masterVariant.id).toBe('number');
    expect(typeof result.masterVariant.images?.length).not.toBeFalsy();
    expect(typeof result.masterVariant.prices?.length).not.toBeFalsy();
  });
});

test('product categories', async () => {
  const categories = await getProductCategories();
  expect(categories).not.toBeNull();
  expect(categories).toBeDefined();
  expect(categories.body).toBeDefined();
  expect(categories.body.results).toBeInstanceOf(Array);
  categories.body.results.forEach((result) => {
    expect(result.id).not.toBeNull();
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    expect(typeof result.name.en).toBe('string');
  });
});

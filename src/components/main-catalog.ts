import { ProductProjection } from '@commercetools/platform-sdk';
import Router from '../services/router/router';
import GoodCartView from './good-cart';
import State from '../services/state';

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function getProducts(): Array<ProductProjection> {
  const catalog = State.catalog?.body.results.filter((el) => {
    if (!el.masterVariant.prices) throw new Error('no data');
    return !el.masterVariant.prices[0].discounted;
  });

  const shownNumbers = new Set();

  if (!catalog) throw new Error('no data');

  while (shownNumbers.size < 4) {
    shownNumbers.add(getRandomInt(catalog.length));
  }

  const shownProducts = catalog.filter((el, index) => shownNumbers.has(index));

  return shownProducts;
}

const createCodeTemplate = (arr: ProductProjection[]): string => {
  return `
  <section class="catalog catalog--main_page">
    <p class="subtitle subtitle--green">Catalog</p>
    <h2 class="catalof-titile">Our Products</h2>
    <ul class="catalog-list list">
    ${arr?.map((el) => new GoodCartView(el).render).join('')}
    </ul>
    <a href="${
      Router.pages.catalog
    }" class="catalog-btn btn btn--blue link">Load More</a>
  </section>`;
};

export default class MainCatalogView {
  public get render(): string {
    const products = getProducts();
    return createCodeTemplate(products);
  }
}

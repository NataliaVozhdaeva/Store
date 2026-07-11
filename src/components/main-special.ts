import GoodCartView from './good-cart';
import State from '../services/state';
import Router from '../services/router/router';

const createCodeTemplate = (): string => {
  let catalog = State.catalog?.body.results.filter((el) => {
    if (!el.masterVariant.prices) throw new Error('no data');
    return el.masterVariant.prices[0].discounted;
  });

  if (!catalog) throw new Error('no data');

  if (catalog.length > 4) {
    catalog = catalog.slice(0, 4);
  }

  return `
  <section class="special_offer special_offer--main_page">
    <div class="special_offer-wrapper">
      <div class="special_offer-top">
        <div>
          <p class="subtitle subtitle--green">For You</p>
          <h3 class="special_offer-title">Special Offer</h3>
        </div>  
        <a href="${
          Router.pages.catalog
        }" class="btn special_offer-btn link btn--yellow">View All Products</a>
      </div>
      <ul class="special_offer-list list">
        ${catalog?.map((el) => new GoodCartView(el).render).join('')} 
      </ul>
    </div>
  </section>`;
};

export default class SpecialOfferView {
  public get render(): string {
    return createCodeTemplate();
  }
}

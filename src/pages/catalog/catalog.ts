/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import {
  ClientResponse,
  ProductProjection,
  ProductProjectionPagedQueryResponse,
  Cart
} from '@commercetools/platform-sdk';

import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import Router from '../../services/router/router';
import State from '../../services/state';
import Component from '../../components/abstract/component';
import ItemView from '../item/item';
import { createElem } from '../../services/viewBuilderFunction';

import {
  GetAnonimCartByID,
  addToAnonimCart,
  addToCart,
  RemoveFromCart,
  RemoveFromAnonimCart,
  GetCartByID
} from '../../api/apiMethods';

Swiper.use([Navigation, Pagination]);

type SortPatternType =
  | undefined
  | 'alphabet-dec'
  | 'alphabet-inc'
  | 'price-dec'
  | 'price-inc';

type PaginationBarType = {
  backButton: HTMLElement;
  forwardButton: HTMLElement;
  currentPageSpan: HTMLElement;
};

type PaginationDirectionType = '+' | '-';

export default class CatalogView extends Component {
  private errorModal: HTMLDialogElement;
  private cardContainer: HTMLElement;
  private currentCategory: string;
  private sortPattern: SortPatternType;
  private abcSortArrow: HTMLDivElement;
  private priceSortArrow: HTMLDivElement;
  private priceFloor: number;
  private priceCeli: number;
  private currentPage: number;
  private paginationControls: PaginationBarType;
  private itemsPerPage = 12;

  constructor() {
    super();
    this.container.classList.add('catalog-container');
    this.errorModal = document.createElement('dialog');
    this.cardContainer = createElem('catalog-card-container');
    this.container.append(this.errorModal);
    this.errorModal.addEventListener('click', () => {
      this.errorModal.close();
    });
    this.currentCategory = 'All categories';
    this.abcSortArrow = createElem('catalog-sort-arrow') as HTMLDivElement;
    this.priceSortArrow = createElem('catalog-sort-arrow') as HTMLDivElement;
    this.priceFloor = 0;
    this.priceCeli = Infinity;
    this.currentPage = 1;
    this.paginationControls = {
      backButton: document.createElement('div'),
      forwardButton: document.createElement('div'),
      currentPageSpan: document.createElement('span')
    };
    this.setItemsPerPage();
    this.paginationControls.backButton.addEventListener('click', () => {
      this.setCurrentPage('-');
    });
    this.paginationControls.forwardButton.addEventListener('click', () => {
      this.setCurrentPage('+');
    });
    window.addEventListener('resize', () => {
      this.setItemsPerPage();
      this.reasignCurrentPage();
      this.fillCardContainer();
      this.fillPaginationBar();
    });
  }

  private renderCatalog(): void {
    const deleteArrow = (arrow: HTMLDivElement): void => {
      arrow.classList.remove('increase');
      arrow.classList.remove('decrease');
    };

    const changeArrow = (
      arrow: HTMLDivElement,
      prev: string,
      curr: string
    ): void => {
      arrow.classList.remove(prev);
      arrow.classList.add(curr);
    };

    this.container.classList.remove('item-page');

    /* catalog controls */
    const catalogHeader = createElem('catalog-header');
    const navGroup = createElem('catalog-nav-group hiden');
    const filterTitle = createElem('catalog-filter-title', 'span', 'Filters');
    filterTitle.addEventListener('click', () => {
      navGroup.classList.toggle('hiden');
      filterTitle.classList.toggle('open');
    });
    const controls = createElem('catalog-controls', 'form');
    const categorySelect = createElem('catalog-category-select', 'select');
    categorySelect.innerHTML = `<option data-id="all">All categories</option>`;
    State.categories?.body.results.forEach((category) => {
      categorySelect.innerHTML += `<option data-id="${category.id}">${category.name.en}</option>`;
    });
    categorySelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.currentCategory = target.value;
      this.fillCardContainer();
    });

    const searchGroup = createElem('catalog-controls-search-group');
    const searchInput = createElem(
      'catalog-search-input',
      'input'
    ) as HTMLInputElement;
    searchInput.placeholder = 'Search...';
    searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this.fillCardContainer(target.value);
    });
    const searchButton = createElem('catalog-search-button');

    searchGroup.append(searchInput, searchButton);

    const abcSortButton = createElem('catalog-sort-button', 'button');
    const priceSortButton = createElem('catalog-sort-button', 'button');
    abcSortButton.classList.add('abc');
    priceSortButton.classList.add('price');
    const abcSortGroup = createElem('catalog-controls-sort-group');
    const priceSortGroup = createElem('catalog-controls-sort-group');
    abcSortGroup.append(abcSortButton, this.abcSortArrow);
    priceSortGroup.append(priceSortButton, this.priceSortArrow);

    const priceRangeGroup = createElem('catalog-controls-range-group');
    const titleSpan = createElem(
      'catalog-controls-range-span',
      'span',
      'Price filter'
    );
    const betweenSpan = createElem('catalog-controls-range-span', 'span', '-');
    const afterSpan = createElem('catalog-controls-range-span', 'span', '€');
    const priceFloorInput = createElem(
      'catalog-controls-range-input',
      'input'
    ) as HTMLInputElement;
    const priceCeliInput = createElem(
      'catalog-controls-range-input',
      'input'
    ) as HTMLInputElement;
    [priceFloorInput, priceCeliInput].forEach((input) => {
      input.type = 'number';
    });

    abcSortButton.addEventListener('click', () => {
      deleteArrow(this.priceSortArrow);
      if (!this.sortPattern) {
        this.sortPattern = 'alphabet-dec';
        this.abcSortArrow.classList.add('decrease');
        this.fillCardContainer();
      } else if (this.sortPattern === 'alphabet-inc') {
        this.sortPattern = 'alphabet-dec';
        changeArrow(this.abcSortArrow, 'increase', 'decrease');
        this.fillCardContainer();
      } else {
        this.sortPattern = 'alphabet-inc';
        changeArrow(this.abcSortArrow, 'decrease', 'increase');
        this.fillCardContainer();
      }
    });

    priceSortButton.addEventListener('click', () => {
      deleteArrow(this.abcSortArrow);
      if (!this.sortPattern) {
        this.sortPattern = 'price-dec';
        this.priceSortArrow.classList.add('decrease');
        this.fillCardContainer();
      } else if (this.sortPattern === 'price-inc') {
        this.sortPattern = 'price-dec';
        changeArrow(this.priceSortArrow, 'increase', 'decrease');
        this.fillCardContainer();
      } else {
        this.sortPattern = 'price-inc';
        changeArrow(this.priceSortArrow, 'decrease', 'increase');
        this.fillCardContainer();
      }
    });

    priceFloorInput.addEventListener('input', () => {
      this.priceFloor = Number(priceFloorInput.value);
      this.fillCardContainer();
    });

    priceCeliInput.addEventListener('input', () => {
      this.priceCeli = Number(priceCeliInput.value) || Infinity;
      this.fillCardContainer();
    });

    controls.append(categorySelect, searchGroup, abcSortGroup, priceSortGroup);

    navGroup.append(controls, priceRangeGroup);
    priceRangeGroup.append(
      titleSpan,
      priceFloorInput,
      betweenSpan,
      priceCeliInput,
      afterSpan
    );

    catalogHeader.append(filterTitle, navGroup);
    this.container.append(catalogHeader);

    /* cards container */
    this.container.append(this.cardContainer);
    this.cardContainer.innerHTML = '';

    /* fill cards container */
    this.fillCardContainer();

    /* paggination bar */
    const paginationBar = createElem('catalog-pagination-bar', 'nav');
    this.paginationControls.currentPageSpan.classList.add(
      'catalog-current-page-span'
    );
    [
      this.paginationControls.backButton,
      this.paginationControls.forwardButton
    ].forEach((button) => {
      button.classList.add('catalog-pagination-button');
    });
    this.paginationControls.backButton.innerText = '<<';
    this.paginationControls.forwardButton.innerText = '>>';

    paginationBar.append(
      this.paginationControls.backButton,
      this.paginationControls.currentPageSpan,
      this.paginationControls.forwardButton
    );
    this.container.append(paginationBar);
    this.fillPaginationBar();
  }

  private renderCatalogItemCard(catalogItem: ProductProjection): HTMLElement {
    const catalogItemLink = createElem(
      'card-item-link',
      'a'
    ) as HTMLAnchorElement;
    catalogItemLink.href = `${Router.pages.catalog}/${catalogItem.slug.en}`;

    const categoryButton = createElem('catalog-card-category-button');
    if (catalogItem.categories[0]) {
      for (const [key, value] of State.CategoryMap.entries()) {
        if (value === catalogItem.categories[0].id) {
          categoryButton.innerText = key;
        }
      }
    } else {
      categoryButton.innerText = 'No category';
    }

    const cardImage = createElem('catalog-card-image');
    if (catalogItem.masterVariant.images?.length) {
      cardImage.style.background = `center / contain no-repeat url('${catalogItem.masterVariant.images[0].url}') #ffff`;
    }

    const cardName = document.createElement('p');
    cardName.classList.add('catalog-card-title');
    cardName.innerText = catalogItem.name.en;

    const toCartBtn = document.createElement('button');
    toCartBtn.className = 'to_cart-btn btn btn--yellow order-submit';
    toCartBtn.textContent = 'Add to cart';
    toCartBtn.setAttribute('data-name', `${catalogItem.slug.en}`);

    const cartArray = State.cart?.body.lineItems.map((el) => {
      return el.name.en.toLowerCase();
    });
    if (cartArray?.includes(catalogItem.slug.en)) {
      toCartBtn.setAttribute('disabled', 'true');
    }

    toCartBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const CART_ID = localStorage.getItem('cartID');

      /* корзина
      if (!CART_ID) throw new Error('error');
      let cartCheck = await GetAnonimCartByID(CART_ID);
      console.log('cart', cartCheck.body.lineItems[1].name.en); */

      if (!CART_ID) {
        await State.setCart();
      }
      if (localStorage.getItem('customerID')) {
        await addToCart(
          State.cart!.body.id,
          await State.getCurrentCartVersion(State.cart!.body.id),
          catalogItem.id,
          catalogItem.masterVariant.id,
          1
        );
      } else {
        await addToAnonimCart(
          State.cart!.body.id,
          await State.getCurrentAnonimCartVersion(State.cart!.body.id),
          catalogItem.id,
          catalogItem.masterVariant.id,
          1
        );
      }

      await State.refreshCart();
      const cartChange = new Event('cart-change');
      window.dispatchEvent(cartChange);
    });

    const priceContainer = createElem('price-container');
    const cardPrice = createElem('catalog-card-price', 'span');
    if (
      catalogItem.masterVariant.prices?.length &&
      catalogItem.masterVariant.prices[0].discounted
    ) {
      const fullPrice = createElem(
        'catalog-card-price full',
        'span',
        `€${(
          Number(catalogItem.masterVariant.prices[0]?.value.centAmount) / 100
        ).toFixed(2)}`
      );
      const discountIcon = createElem(
        'catalog-card-discount-icon',
        'span'
      ) as HTMLSpanElement;
      priceContainer.append(fullPrice, discountIcon);
      cardPrice.innerText = `€${(
        Number(
          catalogItem.masterVariant.prices[0].discounted.value.centAmount
        ) / 100
      ).toFixed(2)}`;
    } else if (catalogItem.masterVariant.prices) {
      cardPrice.innerText = `€${(
        Number(catalogItem.masterVariant.prices[0]?.value.centAmount) / 100
      ).toFixed(2)}`;
    }
    priceContainer.append(cardPrice);

    catalogItemLink.append(
      categoryButton,
      cardImage,
      cardName,
      priceContainer,
      toCartBtn
    );

    return catalogItemLink;
  }

  private fillCardContainer(searchPattern?: string): void {
    const sortByName = (
      catalog: ProductProjection[] | undefined
    ): ProductProjection[] | undefined => {
      catalog?.sort((a, b) => {
        if (a.name.en < b.name.en) {
          return -1;
        }
        if (a.name.en > b.name.en) {
          return 1;
        }
        return 0;
      });
      return catalog;
    };

    const sortByPrice = (
      catalog: ProductProjection[] | undefined
    ): ProductProjection[] | undefined => {
      const undefinedPriceArr = catalog?.filter((item) => {
        return !item.masterVariant.prices?.length;
      });
      const definedPriceArr = catalog?.filter((item) => {
        return item.masterVariant.prices?.length;
      });
      definedPriceArr?.sort((a, b) => {
        return (
          (a.masterVariant.prices![0].discounted?.value.centAmount ||
            a.masterVariant.prices![0].value.centAmount) -
          (b.masterVariant.prices![0].discounted?.value.centAmount ||
            b.masterVariant.prices![0].value.centAmount)
        );
      });
      catalog = [...definedPriceArr!, ...undefinedPriceArr!];
      return catalog;
    };

    const catalog = State.catalog?.body.results;
    this.cardContainer.innerHTML = '';
    let outputArr: ProductProjection[] | undefined;
    if (this.currentCategory === 'All categories') {
      outputArr = catalog;
    } else {
      outputArr = catalog?.filter((item) => {
        return item.categories.some(
          (category) =>
            category.id === State.CategoryMap.get(this.currentCategory)
        );
      });
    }
    if (this.sortPattern) {
      switch (this.sortPattern) {
        case 'alphabet-dec': {
          sortByName(outputArr);
          break;
        }
        case 'alphabet-inc': {
          sortByName(outputArr)?.reverse();
          break;
        }
        case 'price-dec': {
          outputArr = sortByPrice(outputArr);
          break;
        }
        case 'price-inc': {
          outputArr = sortByPrice(outputArr)?.reverse();
          break;
        }
        default: {
          true;
        }
      }
    }
    if (searchPattern) {
      outputArr = catalog?.filter((item) =>
        item.name.en.toLowerCase().includes(searchPattern.toLowerCase())
      );
    }
    outputArr = outputArr?.filter(
      (item) =>
        (item.masterVariant.prices![0].discounted?.value.centAmount ||
          item.masterVariant.prices![0].value.centAmount) /
          100 >=
          this.priceFloor &&
        (item.masterVariant.prices![0].discounted?.value.centAmount ||
          item.masterVariant.prices![0].value.centAmount) /
          100 <=
          this.priceCeli
    );
    outputArr = outputArr?.filter(
      (item, i) =>
        i < this.currentPage * this.itemsPerPage &&
        i >= (this.currentPage - 1) * this.itemsPerPage
    );
    outputArr?.forEach((catalogItem) => {
      const catalogItemLink = this.renderCatalogItemCard(catalogItem);
      this.cardContainer.append(catalogItemLink);
    });
  }

  public async renderItemPage(route: string): Promise<HTMLElement> {
    this.container.innerHTML = '';
    const cardId = route.slice(9);
    if (this.verifiCardId(route, State.catalog)) {
      const chosenItem = State.catalog?.body.results.find(
        (catalogItem) => catalogItem.slug.en === cardId
      );
      if (!chosenItem) throw new Error('error');

      const cartArray = State.cart?.body.lineItems.map((el) => {
        return el.name.en.toLowerCase();
      });
      const orderBtn = !cartArray?.includes(chosenItem.slug.en);
      const item = new ItemView(chosenItem, orderBtn);
      this.container.append(await item.render());
      this.createSlides();

      // marker
      const itemAddButton = document.querySelector('.order-submit');
      const itemAddQuantity = document.querySelector(
        '.order-quantity'
      ) as HTMLInputElement;

      itemAddButton?.addEventListener('click', async (e) => {
        const CART_ID = localStorage.getItem('cartID');
        if (!CART_ID) {
          await State.setCart();
        }
        const target = e.target as HTMLElement;
        if (!State.cart) throw new Error('err in catalog-renderItem');
        const currentGood = State.cart.body.lineItems
          .map((el) => {
            return el.name.en.toLowerCase() === chosenItem.slug.en ? el.id : '';
          })
          .join('');
        if (localStorage.getItem('customerID')) {
          if (!CART_ID) throw new Error('err');
          orderBtn
            ? addToCart(
                State.cart!.body.id,
                await State.getCurrentCartVersion(State.cart!.body.id),
                target.dataset.id!,
                Number(target.dataset.masterVariant),
                itemAddQuantity.value ? Number(itemAddQuantity?.value) : 1
              )
            : await RemoveFromCart(
                CART_ID,
                (await this.getCurrentCartVersion(CART_ID)).version,
                currentGood
              );
        } else {
          if (!CART_ID) throw new Error('err');
          orderBtn
            ? addToAnonimCart(
                State.cart!.body.id,
                await State.getCurrentAnonimCartVersion(State.cart!.body.id),
                target.dataset.id!,
                Number(target.dataset.masterVariant),
                itemAddQuantity.value ? Number(itemAddQuantity?.value) : 1
              )
            : await RemoveFromAnonimCart(
                CART_ID,
                (await this.getCurrentAnonimCartVersion(CART_ID)).version,
                currentGood
              );
        }
        await State.refreshCart();
        setTimeout(() => this.renderItemPage(route), 1000);

        const cartChange = new Event('cart-change');
        window.dispatchEvent(cartChange);
      });
    } else {
      Router.navigate(Router.pages.notFound);
    }

    const slider = document.querySelector('.swiper');
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    const body = document.querySelector('body');
    if (document.querySelector('.overlay')) {
      document.querySelector('.overlay')?.remove();
    }
    const overlay = createElem('overlay');
    body?.append(overlay);

    swiperWrapper?.addEventListener('click', () => {
      slider?.classList.toggle('showModal');
      overlay?.classList.toggle('visible');
      body?.classList.toggle('stop-scroll');
    });

    overlay.addEventListener('click', () => {
      slider?.classList.toggle('showModal');
      overlay?.classList.toggle('visible');
      body?.classList.toggle('stop-scroll');
    });
    return this.container;
  }

  private createSlides(): void {
    const swiper = new Swiper('.swiper', {
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
      loop: true
    });
  }

  public async getCurrentCartVersion(CART_ID: string): Promise<Cart> {
    try {
      const response = await GetCartByID(CART_ID);
      const { body } = response;
      return body;
    } catch (error) {
      console.error('Something went wrong:', error);
      throw error;
    }
  }

  public async getCurrentAnonimCartVersion(CART_ID: string): Promise<Cart> {
    try {
      const response = await GetAnonimCartByID(CART_ID);
      const { body } = response;
      return body;
    } catch (error) {
      console.error('Something went wrong:', error);
      throw error;
    }
  }

  private fillPaginationBar = (): void => {
    this.paginationControls.currentPageSpan.innerText =
      this.currentPage.toString();
    [
      this.paginationControls.backButton,
      this.paginationControls.forwardButton
    ].forEach((button) => {
      button.classList.remove('disabled');
    });
    if (this.currentPage === 1) {
      this.paginationControls.backButton.classList.add('disabled');
    }
    if (this.currentPage === this.setPageCount()) {
      this.paginationControls.forwardButton.classList.add('disabled');
    }
  };

  private setCurrentPage(direction: PaginationDirectionType): void {
    const pageCount = this.setPageCount();
    if (direction === '+' && this.currentPage !== pageCount) {
      this.currentPage += 1;
      this.fillPaginationBar();
      this.fillCardContainer();
    } else if (this.currentPage !== 1 && direction !== '+') {
      this.currentPage -= 1;
      this.fillPaginationBar();
      this.fillCardContainer();
    }
  }

  private setItemsPerPage(): void {
    const viewPortWidth = window.screen.width;
    if (viewPortWidth > 1600) {
      this.itemsPerPage = 12;
    } else if (viewPortWidth <= 1600 && viewPortWidth > 1200) {
      this.itemsPerPage = 9;
    } else if (viewPortWidth <= 1200 && viewPortWidth > 750) {
      this.itemsPerPage = 6;
    } else if (viewPortWidth <= 750) {
      this.itemsPerPage = 4;
    }
  }

  private setPageCount(): number {
    return State.catalog?.body.results.length
      ? Math.ceil(State.catalog?.body.results.length / this.itemsPerPage)
      : 0;
  }

  private reasignCurrentPage(): void {
    const pageCount = this.setPageCount();
    if (this.currentPage > pageCount) {
      this.currentPage = pageCount;
    }
  }

  private verifiCardId(
    route: string,
    catalog: ClientResponse<ProductProjectionPagedQueryResponse> | undefined
  ): boolean {
    if (!catalog) {
      return false;
    }
    const catalogIds = catalog?.body.results.map(
      (catalogItem) => catalogItem.slug.en
    );

    const cardId = route.slice(9);
    return catalogIds?.includes(cardId);
  }

  public render(): HTMLElement {
    this.container.innerHTML = '';
    this.currentCategory = 'All categories';
    this.renderCatalog();
    return this.container;
  }
}

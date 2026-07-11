/* eslint-disable max-lines-per-function */
import type {
  Category,
  ProductProjection
} from '@commercetools/platform-sdk';
import {
  CreateProduct,
  DeleteProduct,
  UpdateProduct,
  GetProductsPublished,
  getProductCategories,
  ProductInput
} from '../../api/apiMethods';
import Component from '../../components/abstract/component';

const FORM_FIELDS = `
  <label>Name
    <input type="text" class="admin-field-name" required>
  </label>
  <label>Category
    <select class="admin-field-category"></select>
  </label>
  <label>Price, EUR
    <input type="number" class="admin-field-price" min="0" step="0.01" required>
  </label>
  <label>Discounted price, EUR (optional)
    <input type="number" class="admin-field-discount" min="0" step="0.01">
  </label>
  <label>Description
    <textarea class="admin-field-description" rows="3"></textarea>
  </label>
  <label>Image URLs, comma separated (optional)
    <input type="text" class="admin-field-images">
  </label>
`;

export default class AdminView extends Component {
  private products: ProductProjection[] = [];
  private categories: Category[] = [];
  private editModal!: HTMLDialogElement;
  private messageModal: HTMLDialogElement;

  constructor() {
    super();
    this.container.classList.add('admin');
    this.messageModal = document.createElement('dialog');
    this.messageModal.classList.add('app-modal', 'app-modal--error');
    this.messageModal.addEventListener('click', () => this.messageModal.close());
  }

  public render(): HTMLElement {
    this.container.innerHTML = `<h2 class="admin-title">Product management</h2>
      <p class="admin-status">Loading…</p>`;
    this.load();
    return this.container;
  }

  private async load(): Promise<void> {
    try {
      const [prodRes, catRes] = await Promise.all([
        GetProductsPublished(),
        getProductCategories()
      ]);
      this.products = prodRes.body.results;
      this.categories = catRes.body.results;
      this.draw();
    } catch (error) {
      this.container.innerHTML = `<h2 class="admin-title">Product management</h2>
        <p class="admin-status">Failed to load data. Is the backend running?</p>`;
    }
  }

  private categoryName(id: string | undefined): string {
    return this.categories.find((c) => c.id === id)?.name?.en ?? '—';
  }

  private price(product: ProductProjection): {
    base: number | undefined;
    discounted: number | undefined;
  } {
    const p = product.masterVariant.prices?.[0];
    return {
      base: p?.value.centAmount,
      discounted: p?.discounted?.value.centAmount
    };
  }

  private static euro(cents: number | undefined): string {
    return cents === undefined ? '—' : `€${(cents / 100).toFixed(2)}`;
  }

  private categoryOptions(selectedId?: string): string {
    return this.categories
      .map(
        (c) =>
          `<option value="${c.id}" ${
            c.id === selectedId ? 'selected' : ''
          }>${c.name?.en ?? c.id}</option>`
      )
      .join('');
  }

  private draw(): void {
    this.container.innerHTML = `
      <h2 class="admin-title">Product management</h2>

      <section class="admin-add">
        <h3 class="admin-subtitle">Add a new product</h3>
        <form class="admin-form">
          ${FORM_FIELDS}
          <button type="submit" class="admin-btn admin-btn--primary">Add product</button>
        </form>
      </section>

      <section class="admin-list">
        <h3 class="admin-subtitle">Catalog (${this.products.length})</h3>
        <table class="admin-table">
          <thead>
            <tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Discount</th><th></th></tr>
          </thead>
          <tbody></tbody>
        </table>
      </section>

      <dialog class="app-modal admin-edit-modal">
        <h3>Edit product</h3>
        <div class="admin-form admin-form--modal">${FORM_FIELDS}</div>
        <button id="save-btn">Save</button>
        <button id="cancel-btn">Cancel</button>
      </dialog>
    `;
    this.container.append(this.messageModal);

    const addForm = this.container.querySelector('.admin-form') as HTMLFormElement;
    (addForm.querySelector('.admin-field-category') as HTMLSelectElement).innerHTML =
      this.categoryOptions();
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAdd(addForm);
    });

    this.editModal = this.container.querySelector(
      '.admin-edit-modal'
    ) as HTMLDialogElement;
    (
      this.editModal.querySelector('#cancel-btn') as HTMLElement
    ).addEventListener('click', () => this.editModal.close());

    const tbody = this.container.querySelector(
      '.admin-table tbody'
    ) as HTMLElement;
    this.products.forEach((product) => tbody.append(this.row(product)));
  }

  private row(product: ProductProjection): HTMLElement {
    const { base, discounted } = this.price(product);
    const tr = document.createElement('tr');
    const image = product.masterVariant.images?.[0]?.url ?? '';
    tr.innerHTML = `
      <td><img class="admin-thumb" src="${image}" alt=""></td>
      <td>${product.name.en}</td>
      <td>${this.categoryName(product.categories[0]?.id)}</td>
      <td>${AdminView.euro(base)}</td>
      <td>${AdminView.euro(discounted)}</td>
      <td class="admin-actions">
        <button class="admin-btn admin-btn--edit">Edit</button>
        <button class="admin-btn admin-btn--delete">Delete</button>
      </td>
    `;
    (tr.querySelector('.admin-btn--edit') as HTMLElement).addEventListener(
      'click',
      () => this.openEdit(product)
    );
    (tr.querySelector('.admin-btn--delete') as HTMLElement).addEventListener(
      'click',
      () => this.handleDelete(product)
    );
    return tr;
  }

  private readForm(root: ParentNode): ProductInput | null {
    const name = (root.querySelector('.admin-field-name') as HTMLInputElement)
      .value.trim();
    const categoryId = (
      root.querySelector('.admin-field-category') as HTMLSelectElement
    ).value;
    const priceValue = (
      root.querySelector('.admin-field-price') as HTMLInputElement
    ).value;
    const discountValue = (
      root.querySelector('.admin-field-discount') as HTMLInputElement
    ).value;
    const description = (
      root.querySelector('.admin-field-description') as HTMLTextAreaElement
    ).value.trim();
    const imagesRaw = (
      root.querySelector('.admin-field-images') as HTMLInputElement
    ).value.trim();

    if (!name || !categoryId || priceValue === '') {
      this.showMessage('Please fill in name, category and price.', false);
      return null;
    }

    const imageUrls = imagesRaw
      ? imagesRaw.split(',').map((u) => u.trim()).filter(Boolean)
      : undefined;

    return {
      name,
      categoryId,
      centAmount: Math.round(parseFloat(priceValue) * 100),
      discountedCentAmount: discountValue
        ? Math.round(parseFloat(discountValue) * 100)
        : null,
      description,
      imageUrls
    };
  }

  private fillForm(root: ParentNode, product: ProductProjection): void {
    const { base, discounted } = this.price(product);
    (root.querySelector('.admin-field-name') as HTMLInputElement).value =
      product.name.en;
    (root.querySelector('.admin-field-category') as HTMLSelectElement).innerHTML =
      this.categoryOptions(product.categories[0]?.id);
    (root.querySelector('.admin-field-price') as HTMLInputElement).value =
      base === undefined ? '' : (base / 100).toFixed(2);
    (root.querySelector('.admin-field-discount') as HTMLInputElement).value =
      discounted === undefined ? '' : (discounted / 100).toFixed(2);
    (
      root.querySelector('.admin-field-description') as HTMLTextAreaElement
    ).value = product.description?.en ?? '';
    (root.querySelector('.admin-field-images') as HTMLInputElement).value = (
      product.masterVariant.images ?? []
    )
      .map((i) => i.url)
      .join(', ');
  }

  private async handleAdd(form: HTMLFormElement): Promise<void> {
    const input = this.readForm(form);
    if (!input) return;
    try {
      await CreateProduct(input);
      await this.load();
    } catch (error) {
      this.showMessage('Could not create the product.', false);
    }
  }

  private openEdit(product: ProductProjection): void {
    this.fillForm(this.editModal, product);
    const saveBtn = this.editModal.querySelector('#save-btn') as HTMLElement;
    const clone = saveBtn.cloneNode(true) as HTMLElement;
    saveBtn.replaceWith(clone);
    clone.addEventListener('click', () => this.handleUpdate(product));
    this.editModal.showModal();
  }

  private async handleUpdate(product: ProductProjection): Promise<void> {
    const input = this.readForm(this.editModal);
    if (!input) return;
    try {
      await UpdateProduct(product.id, input);
      this.editModal.close();
      await this.load();
    } catch (error) {
      this.showMessage('Could not update the product.', false);
    }
  }

  private async handleDelete(product: ProductProjection): Promise<void> {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete "${product.name.en}"?`)) return;
    try {
      await DeleteProduct(product.id);
      await this.load();
    } catch (error) {
      this.showMessage(
        'Could not delete: the product may be in a customer cart.',
        false
      );
    }
  }

  private showMessage(text: string, ok: boolean): void {
    this.messageModal.innerText = text;
    this.messageModal.classList.toggle('app-modal--success', ok);
    this.messageModal.classList.toggle('app-modal--error', !ok);
    this.messageModal.showModal();
  }
}

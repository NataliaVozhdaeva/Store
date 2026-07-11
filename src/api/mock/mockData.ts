import type {
  Category,
  ProductProjection,
  Price
} from '@commercetools/platform-sdk';

const NOW = '2023-09-01T00:00:00.000Z';

export const CATEGORIES: Category[] = [
  { id: 'cat-fruits', key: 'fruits', name: { en: 'Fruits' } },
  { id: 'cat-vegetables', key: 'vegetables', name: { en: 'Vegetables' } },
  { id: 'cat-nuts', key: 'nuts', name: { en: 'Nuts & Grains' } },
  { id: 'cat-drinks', key: 'drinks', name: { en: 'Drinks' } },
  { id: 'cat-ready', key: 'ready-to-eat', name: { en: 'Ready-to-eat' } }
].map((cat, index) => {
  return {
    ...cat,
    version: 1,
    createdAt: NOW,
    lastModifiedAt: NOW,
    slug: { en: cat.key },
    orderHint: String(index),
    ancestors: []
  } as unknown as Category;
});

type ProductSeed = {
  name: string;
  categoryId: string;
  centAmount: number;
  discountedCentAmount?: number;
  description: string;
};

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    name: 'Avocado',
    categoryId: 'cat-fruits',
    centAmount: 350,
    description: 'Ripe Hass avocado, rich in healthy fats and vitamins.'
  },
  {
    name: 'Blueberry',
    categoryId: 'cat-fruits',
    centAmount: 590,
    description: 'Fresh organic blueberries, packed with antioxidants.'
  },
  {
    name: 'Mango',
    categoryId: 'cat-fruits',
    centAmount: 420,
    description: 'Sweet and juicy mango, perfect for smoothies and salads.'
  },
  {
    name: 'Kiwi',
    categoryId: 'cat-fruits',
    centAmount: 280,
    description: 'Tangy green kiwi, an excellent source of vitamin C.'
  },
  {
    name: 'Lemon',
    categoryId: 'cat-fruits',
    centAmount: 190,
    description: 'Zesty lemons for cooking, baking and refreshing drinks.'
  },
  {
    name: 'Broccoli',
    categoryId: 'cat-vegetables',
    centAmount: 310,
    description: 'Crisp green broccoli, steamed or roasted in minutes.'
  },
  {
    name: 'Spinach',
    categoryId: 'cat-vegetables',
    centAmount: 250,
    description: 'Tender baby spinach leaves, great for salads and stews.'
  },
  {
    name: 'Carrot',
    categoryId: 'cat-vegetables',
    centAmount: 180,
    description: 'Sweet crunchy carrots, full of beta-carotene.'
  },
  {
    name: 'Almonds',
    categoryId: 'cat-nuts',
    centAmount: 890,
    description: 'Raw whole almonds, a wholesome protein-rich snack.'
  },
  {
    name: 'Tea',
    categoryId: 'cat-drinks',
    centAmount: 450,
    description: 'Loose-leaf green tea with a delicate fresh aroma.'
  },
  {
    name: 'Strawberry',
    categoryId: 'cat-fruits',
    centAmount: 650,
    discountedCentAmount: 520,
    description: 'Sun-ripened strawberries, sweet and fragrant.'
  },
  {
    name: 'Orange',
    categoryId: 'cat-fruits',
    centAmount: 320,
    discountedCentAmount: 240,
    description: 'Juicy oranges bursting with vitamin C.'
  },
  {
    name: 'Tomatoes',
    categoryId: 'cat-vegetables',
    centAmount: 380,
    discountedCentAmount: 290,
    description: 'Vine-ripened tomatoes with a rich garden flavour.'
  },
  {
    name: 'Walnuts',
    categoryId: 'cat-nuts',
    centAmount: 990,
    discountedCentAmount: 790,
    description: 'Shelled walnuts, a natural source of omega-3.'
  },
  {
    name: 'Oatmeal',
    categoryId: 'cat-nuts',
    centAmount: 340,
    discountedCentAmount: 260,
    description: 'Whole-grain rolled oats for a hearty breakfast.'
  },
  {
    name: 'Smoothie',
    categoryId: 'cat-ready',
    centAmount: 550,
    discountedCentAmount: 440,
    description: 'Cold-pressed berry smoothie with no added sugar.'
  },
  {
    name: 'Potato',
    categoryId: 'cat-vegetables',
    centAmount: 120,
    description: 'A kitchen classic with endless possibilities.'
  },
  {
    name: 'Bread',
    categoryId: 'cat-ready',
    centAmount: 470,
    description: 'Fresh tasty bread.'
  },
  {
    name: 'Juice',
    categoryId: 'cat-drinks',
    centAmount: 430,
    description: "From nature's garden to your morning glass."
  },
  {
    name: 'Watermelon',
    categoryId: 'cat-fruits',
    centAmount: 870,
    description:
      'Crisp, refreshing, and naturally sweet. Every slice tastes like sunshine.'
  },
  {
    name: 'Cherry',
    categoryId: 'cat-fruits',
    centAmount: 310,
    description: 'Tiny fruit, big personality.'
  },
  {
    name: 'Cookies',
    categoryId: 'cat-ready',
    centAmount: 730,
    description: 'Crispy edges, soft center, pure happiness.'
  },
  {
    name: 'Apples',
    categoryId: 'cat-fruits',
    centAmount: 280,
    description: 'Fresh from the orchard, packed with goodness.'
  },
  {
    name: 'Macadamia',
    categoryId: 'cat-nuts',
    centAmount: 980,
    description: 'Smooth, creamy, and naturally luxurious.'
  }
];

function makePrice(seed: ProductSeed, index: number): Price {
  const price = {
    id: `price-${index}`,
    value: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: seed.centAmount,
      fractionDigits: 2
    }
  } as unknown as Price;
  if (seed.discountedCentAmount) {
    return {
      ...price,
      discounted: {
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: seed.discountedCentAmount,
          fractionDigits: 2
        },
        discount: { typeId: 'product-discount', id: 'pd-autumn-sale' }
      }
    } as unknown as Price;
  }
  return price;
}

// Собирает ProductProjection из короткого описания товара.
// Слаг = имя в нижнем регистре: на этом равенстве держится логика
// «товар уже в корзине» в catalog.ts (сравнение name.en.toLowerCase() со slug.en).
// Картинок ровно 2: первая — миниатюра (карточка каталога, корзина),
// обе вместе — слайдер на странице товара (item.ts показывает все images).
function makeProduct(seed: ProductSeed, index: number): ProductProjection {
  const slug = seed.name.toLowerCase();
  return {
    id: `prod-${slug}`,
    version: 1,
    createdAt: NOW,
    lastModifiedAt: NOW,
    productType: { typeId: 'product-type', id: 'pt-food' },
    name: { en: seed.name },
    slug: { en: slug },
    description: { en: seed.description },
    categories: [{ typeId: 'category', id: seed.categoryId }],
    masterVariant: {
      id: 1,
      images: [1, 2].map((n) => ({
        url: `./images/products/${slug}-${n}.jpg`,
        dimensions: { w: 600, h: 600 }
      })),
      prices: [makePrice(seed, index)]
    },
    variants: [],
    searchKeywords: {}
  } as unknown as ProductProjection;
}

export const PRODUCTS: ProductProjection[] = PRODUCT_SEEDS.map(makeProduct);

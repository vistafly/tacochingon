import { MenuItem, ItemCustomization } from '@/types/menu';

const now = new Date();

// ── Meat Selectors ─────────────────────────────────────────────────────

// Full meat options: asada, pastor, pollo, chorizo, carnitas, veggie
const meatSelectFull: ItemCustomization[] = [
  { id: 'meat-asada', name: { en: 'Asada', es: 'Asada' }, type: 'select', group: 'meat', groupLabel: { en: 'Choose Your Meat', es: 'Elige Tu Carne' } },
  { id: 'meat-pastor', name: { en: 'Pastor', es: 'Pastor' }, type: 'select', group: 'meat' },
  { id: 'meat-pollo', name: { en: 'Pollo', es: 'Pollo' }, type: 'select', group: 'meat' },
  { id: 'meat-chorizo', name: { en: 'Chorizo', es: 'Chorizo' }, type: 'select', group: 'meat' },
  { id: 'meat-carnitas', name: { en: 'Carnitas', es: 'Carnitas' }, type: 'select', group: 'meat' },
  { id: 'meat-veggie', name: { en: 'Veggie', es: 'Veggie' }, type: 'select', group: 'meat' },
];

// Taco Chingon meats: asada, pastor, pollo, chorizo, carnitas
const meatSelectChingon: ItemCustomization[] = [
  { id: 'meat-asada', name: { en: 'Asada', es: 'Asada' }, type: 'select', group: 'meat', groupLabel: { en: 'Choose Your Meat', es: 'Elige Tu Carne' } },
  { id: 'meat-pastor', name: { en: 'Pastor', es: 'Pastor' }, type: 'select', group: 'meat' },
  { id: 'meat-pollo', name: { en: 'Pollo', es: 'Pollo' }, type: 'select', group: 'meat' },
  { id: 'meat-chorizo', name: { en: 'Chorizo', es: 'Chorizo' }, type: 'select', group: 'meat' },
  { id: 'meat-carnitas', name: { en: 'Carnitas', es: 'Carnitas' }, type: 'select', group: 'meat' },
];

// Quesadilla with meat: asada, pastor, pollo, chorizo, carnitas, veggie
const meatSelectQuesadillaMeat: ItemCustomization[] = [
  { id: 'meat-asada', name: { en: 'Asada', es: 'Asada' }, type: 'select', group: 'meat', groupLabel: { en: 'Choose Your Meat', es: 'Elige Tu Carne' } },
  { id: 'meat-pastor', name: { en: 'Pastor', es: 'Pastor' }, type: 'select', group: 'meat' },
  { id: 'meat-pollo', name: { en: 'Pollo', es: 'Pollo' }, type: 'select', group: 'meat' },
  { id: 'meat-chorizo', name: { en: 'Chorizo', es: 'Chorizo' }, type: 'select', group: 'meat' },
  { id: 'meat-carnitas', name: { en: 'Carnitas', es: 'Carnitas' }, type: 'select', group: 'meat' },
  { id: 'meat-veggie', name: { en: 'Veggie', es: 'Veggie' }, type: 'select', group: 'meat' },
];

// Burrito meats: asada, pastor, pollo, chorizo, carnitas, veggie
const meatSelectBurrito: ItemCustomization[] = [
  { id: 'meat-asada', name: { en: 'Asada', es: 'Asada' }, type: 'select', group: 'meat', groupLabel: { en: 'Choose Your Meat', es: 'Elige Tu Carne' } },
  { id: 'meat-pastor', name: { en: 'Pastor', es: 'Pastor' }, type: 'select', group: 'meat' },
  { id: 'meat-pollo', name: { en: 'Pollo', es: 'Pollo' }, type: 'select', group: 'meat' },
  { id: 'meat-chorizo', name: { en: 'Chorizo', es: 'Chorizo' }, type: 'select', group: 'meat' },
  { id: 'meat-carnitas', name: { en: 'Carnitas', es: 'Carnitas' }, type: 'select', group: 'meat' },
  { id: 'meat-veggie', name: { en: 'Veggie', es: 'Veggie' }, type: 'select', group: 'meat' },
];

// Torta meats: asada, pastor, pollo, chorizo, carnitas, veggie
const meatSelectTorta: ItemCustomization[] = [
  { id: 'meat-asada', name: { en: 'Asada', es: 'Asada' }, type: 'select', group: 'meat', groupLabel: { en: 'Choose Your Meat', es: 'Elige Tu Carne' } },
  { id: 'meat-pastor', name: { en: 'Pastor', es: 'Pastor' }, type: 'select', group: 'meat' },
  { id: 'meat-pollo', name: { en: 'Pollo', es: 'Pollo' }, type: 'select', group: 'meat' },
  { id: 'meat-chorizo', name: { en: 'Chorizo', es: 'Chorizo' }, type: 'select', group: 'meat' },
  { id: 'meat-carnitas', name: { en: 'Carnitas', es: 'Carnitas' }, type: 'select', group: 'meat' },
  { id: 'meat-veggie', name: { en: 'Veggie', es: 'Veggie' }, type: 'select', group: 'meat' },
];

// Huarache/Sope meats: asada, pastor, pollo, chorizo, carnitas, veggie, no carne
const meatSelectHuarache: ItemCustomization[] = [
  { id: 'meat-asada', name: { en: 'Asada', es: 'Asada' }, type: 'select', group: 'meat', groupLabel: { en: 'Choose Your Meat', es: 'Elige Tu Carne' } },
  { id: 'meat-pastor', name: { en: 'Pastor', es: 'Pastor' }, type: 'select', group: 'meat' },
  { id: 'meat-pollo', name: { en: 'Pollo', es: 'Pollo' }, type: 'select', group: 'meat' },
  { id: 'meat-chorizo', name: { en: 'Chorizo', es: 'Chorizo' }, type: 'select', group: 'meat' },
  { id: 'meat-carnitas', name: { en: 'Carnitas', es: 'Carnitas' }, type: 'select', group: 'meat' },
  { id: 'meat-veggie', name: { en: 'Veggie', es: 'Veggie' }, type: 'select', group: 'meat' },
  { id: 'meat-none', name: { en: 'No Carne', es: 'Sin Carne' }, type: 'select', group: 'meat' },
];

// Loaded Fries meats: asada, pastor, pollo, chorizo, carnitas
const meatSelectFries: ItemCustomization[] = [
  { id: 'meat-asada', name: { en: 'Asada', es: 'Asada' }, type: 'select', group: 'meat', groupLabel: { en: 'Choose Your Meat', es: 'Elige Tu Carne' } },
  { id: 'meat-pastor', name: { en: 'Pastor', es: 'Pastor' }, type: 'select', group: 'meat' },
  { id: 'meat-pollo', name: { en: 'Pollo', es: 'Pollo' }, type: 'select', group: 'meat' },
  { id: 'meat-chorizo', name: { en: 'Chorizo', es: 'Chorizo' }, type: 'select', group: 'meat' },
  { id: 'meat-carnitas', name: { en: 'Carnitas', es: 'Carnitas' }, type: 'select', group: 'meat' },
];

// Tostitacos meats: asada, pastor, pollo, chorizo, carnitas
const meatSelectTostitacos: ItemCustomization[] = [
  { id: 'meat-asada', name: { en: 'Asada', es: 'Asada' }, type: 'select', group: 'meat', groupLabel: { en: 'Choose Your Meat', es: 'Elige Tu Carne' } },
  { id: 'meat-pastor', name: { en: 'Pastor', es: 'Pastor' }, type: 'select', group: 'meat' },
  { id: 'meat-pollo', name: { en: 'Pollo', es: 'Pollo' }, type: 'select', group: 'meat' },
  { id: 'meat-chorizo', name: { en: 'Chorizo', es: 'Chorizo' }, type: 'select', group: 'meat' },
  { id: 'meat-carnitas', name: { en: 'Carnitas', es: 'Carnitas' }, type: 'select', group: 'meat' },
];

// ── Flavor Selectors (Drinks) ──────────────────────────────────────────

const sodaFlavorSelect: ItemCustomization[] = [
  { id: 'flavor-pepsi', name: { en: 'Pepsi', es: 'Pepsi' }, type: 'select', group: 'flavor', groupLabel: { en: 'Choose Your Flavor', es: 'Elige Tu Sabor' } },
  { id: 'flavor-coca-cola', name: { en: 'Coca Cola', es: 'Coca Cola' }, type: 'select', group: 'flavor' },
  { id: 'flavor-sprite', name: { en: 'Sprite', es: 'Sprite' }, type: 'select', group: 'flavor' },
  { id: 'flavor-squirt', name: { en: 'Squirt', es: 'Squirt' }, type: 'select', group: 'flavor' },
  { id: 'flavor-dr-pepper', name: { en: 'Dr Pepper', es: 'Dr Pepper' }, type: 'select', group: 'flavor' },
];

const jarritosFlavorSelect: ItemCustomization[] = [
  { id: 'flavor-mandarina', name: { en: 'Mandarina', es: 'Mandarina' }, type: 'select', group: 'flavor', groupLabel: { en: 'Choose Your Flavor', es: 'Elige Tu Sabor' } },
  { id: 'flavor-limon', name: { en: 'Limon', es: 'Limón' }, type: 'select', group: 'flavor' },
  { id: 'flavor-pina', name: { en: 'Piña', es: 'Piña' }, type: 'select', group: 'flavor' },
];

// ── Remove/Add Customization Options ───────────────────────────────────

const tacoCustomizations: ItemCustomization[] = [
  { id: 'no-onion', name: { en: 'No Onion', es: 'Sin Cebolla' }, type: 'remove', default: true },
  { id: 'no-cilantro', name: { en: 'No Cilantro', es: 'Sin Cilantro' }, type: 'remove', default: true },
  { id: 'no-cabbage', name: { en: 'No Cabbage', es: 'Sin Repollo' }, type: 'remove', default: true },
  { id: 'no-tomato', name: { en: 'No Tomato', es: 'Sin Tomate' }, type: 'remove', default: true },
  { id: 'no-jalapeno', name: { en: 'No Jalapeño', es: 'Sin Jalapeño' }, type: 'remove', default: true },
  { id: 'no-guacamole', name: { en: 'No Guacamole', es: 'Sin Guacamole' }, type: 'remove', default: true },
  { id: 'extra-cheese', name: { en: 'Extra Cheese', es: 'Extra Queso' }, type: 'add', price: 0.50 },
  { id: 'extra-sour-cream', name: { en: 'Extra Sour Cream', es: 'Extra Crema' }, type: 'add', price: 0.50 },
  { id: 'extra-guacamole', name: { en: 'Extra Guacamole', es: 'Extra Guacamole' }, type: 'add', price: 0.50 },
  { id: 'extra-jalapenos', name: { en: 'Extra Jalapeños', es: 'Extra Jalapeños' }, type: 'add', price: 0.50 },
  { id: 'extra-beans', name: { en: 'Extra Beans', es: 'Extra Frijoles' }, type: 'add', price: 0.50 },
  { id: 'extra-rice', name: { en: 'Extra Rice', es: 'Extra Arroz' }, type: 'add', price: 0.50 },
  { id: 'extra-meat', name: { en: 'Extra Meat', es: 'Extra Carne' }, type: 'add', price: 1.00 },
  { id: 'extra-tomato', name: { en: 'Extra Tomato', es: 'Extra Tomate' }, type: 'add', price: 0.50 },
  { id: 'extra-lettuce', name: { en: 'Extra Lettuce', es: 'Extra Lechuga' }, type: 'add', price: 0.50 },
];

const tacoChingonCustomizations: ItemCustomization[] = [
  { id: 'no-onion', name: { en: 'No Onion', es: 'Sin Cebolla' }, type: 'remove', default: true },
  { id: 'no-cilantro', name: { en: 'No Cilantro', es: 'Sin Cilantro' }, type: 'remove', default: true },
  { id: 'no-lettuce', name: { en: 'No Lettuce', es: 'Sin Lechuga' }, type: 'remove', default: true },
  { id: 'no-tomato', name: { en: 'No Tomato', es: 'Sin Tomate' }, type: 'remove', default: true },
  { id: 'no-sour-cream', name: { en: 'No Sour Cream', es: 'Sin Crema' }, type: 'remove', default: true },
  { id: 'no-guacamole', name: { en: 'No Guacamole', es: 'Sin Guacamole' }, type: 'remove', default: true },
  { id: 'no-cheese', name: { en: 'No Cheese', es: 'Sin Queso' }, type: 'remove', default: true },
  { id: 'extra-cheese', name: { en: 'Extra Cheese', es: 'Extra Queso' }, type: 'add', price: 0.50 },
  { id: 'extra-sour-cream', name: { en: 'Extra Sour Cream', es: 'Extra Crema' }, type: 'add', price: 0.50 },
  { id: 'extra-guacamole', name: { en: 'Extra Guacamole', es: 'Extra Guacamole' }, type: 'add', price: 0.50 },
  { id: 'extra-jalapenos', name: { en: 'Extra Jalapeños', es: 'Extra Jalapeños' }, type: 'add', price: 0.50 },
  { id: 'extra-meat', name: { en: 'Extra Meat', es: 'Extra Carne' }, type: 'add', price: 1.00 },
];

const quesadillaCustomizations: ItemCustomization[] = [
  { id: 'no-cheese', name: { en: 'Light Cheese', es: 'Poco Queso' }, type: 'remove', default: true },
  { id: 'add-sour-cream', name: { en: 'Add Sour Cream', es: 'Agregar Crema' }, type: 'add', price: 0.75 },
  { id: 'add-guacamole', name: { en: 'Add Guacamole', es: 'Agregar Guacamole' }, type: 'add', price: 1.50 },
  { id: 'add-jalapenos', name: { en: 'Add Jalapenos', es: 'Agregar Jalapenos' }, type: 'add', price: 0.50 },
];

const burritoCustomizations: ItemCustomization[] = [
  { id: 'no-rice', name: { en: 'No Rice', es: 'Sin Arroz' }, type: 'remove', default: true },
  { id: 'no-beans', name: { en: 'No Beans', es: 'Sin Frijoles' }, type: 'remove', default: true },
  { id: 'no-onion', name: { en: 'No Onion', es: 'Sin Cebolla' }, type: 'remove', default: true },
  { id: 'no-cilantro', name: { en: 'No Cilantro', es: 'Sin Cilantro' }, type: 'remove', default: true },
  { id: 'no-sour-cream', name: { en: 'No Sour Cream', es: 'Sin Crema' }, type: 'remove', default: true },
  { id: 'extra-cheese', name: { en: 'Extra Cheese', es: 'Extra Queso' }, type: 'add', price: 0.50 },
  { id: 'extra-guacamole', name: { en: 'Extra Guacamole', es: 'Extra Guacamole' }, type: 'add', price: 0.50 },
  { id: 'extra-jalapenos', name: { en: 'Extra Jalapeños', es: 'Extra Jalapeños' }, type: 'add', price: 0.50 },
  { id: 'extra-sour-cream', name: { en: 'Extra Sour Cream', es: 'Extra Crema' }, type: 'add', price: 0.50 },
  { id: 'extra-meat', name: { en: 'Extra Meat', es: 'Extra Carne' }, type: 'add', price: 1.00 },
];

const tortaCustomizations: ItemCustomization[] = [
  { id: 'meat-only', name: { en: 'Meat Only', es: 'Solo Carne' }, type: 'remove', default: false },
  { id: 'no-beans', name: { en: 'No Beans', es: 'Sin Frijoles' }, type: 'remove', default: true },
  { id: 'no-lettuce', name: { en: 'No Lettuce', es: 'Sin Lechuga' }, type: 'remove', default: true },
  { id: 'no-tomato', name: { en: 'No Tomato', es: 'Sin Tomate' }, type: 'remove', default: true },
  { id: 'no-avocado', name: { en: 'No Avocado', es: 'Sin Aguacate' }, type: 'remove', default: true },
  { id: 'no-sour-cream', name: { en: 'No Sour Cream', es: 'Sin Crema' }, type: 'remove', default: true },
  { id: 'no-cheese', name: { en: 'No Cheese', es: 'Sin Queso' }, type: 'remove', default: true },
  { id: 'no-jalapeno', name: { en: 'No Jalapeño', es: 'Sin Jalapeño' }, type: 'remove', default: true },
  { id: 'extra-meat', name: { en: 'Extra Meat', es: 'Extra Carne' }, type: 'add', price: 1.00 },
  { id: 'extra-cheese', name: { en: 'Extra Cheese', es: 'Extra Queso' }, type: 'add', price: 0.50 },
];

const huaracheCustomizations: ItemCustomization[] = [
  { id: 'no-beans', name: { en: 'No Beans', es: 'Sin Frijoles' }, type: 'remove', default: true },
  { id: 'no-sour-cream', name: { en: 'No Sour Cream', es: 'Sin Crema' }, type: 'remove', default: true },
  { id: 'no-cheese', name: { en: 'No Cheese', es: 'Sin Queso' }, type: 'remove', default: true },
  { id: 'add-guacamole', name: { en: 'Add Guacamole', es: 'Agregar Guacamole' }, type: 'add', price: 1.50 },
  { id: 'add-jalapenos', name: { en: 'Add Jalapenos', es: 'Agregar Jalapenos' }, type: 'add', price: 0.50 },
];

const sopeCustomizations: ItemCustomization[] = [
  { id: 'no-beans', name: { en: 'No Beans', es: 'Sin Frijoles' }, type: 'remove', default: true },
  { id: 'no-sour-cream', name: { en: 'No Sour Cream', es: 'Sin Crema' }, type: 'remove', default: true },
  { id: 'no-cheese', name: { en: 'No Cheese', es: 'Sin Queso' }, type: 'remove', default: true },
  { id: 'add-guacamole', name: { en: 'Add Guacamole', es: 'Agregar Guacamole' }, type: 'add', price: 1.50 },
];

const friesCustomizations: ItemCustomization[] = [
  { id: 'no-onion', name: { en: 'No Onion', es: 'Sin Cebolla' }, type: 'remove', default: true },
  { id: 'no-cilantro', name: { en: 'No Cilantro', es: 'Sin Cilantro' }, type: 'remove', default: true },
  { id: 'no-cabbage', name: { en: 'No Cabbage', es: 'Sin Repollo' }, type: 'remove', default: true },
  { id: 'no-tomato', name: { en: 'No Tomato', es: 'Sin Tomate' }, type: 'remove', default: true },
  { id: 'no-jalapeno', name: { en: 'No Jalapeño', es: 'Sin Jalapeño' }, type: 'remove', default: true },
  { id: 'no-guacamole', name: { en: 'No Guacamole', es: 'Sin Guacamole' }, type: 'remove', default: true },
  { id: 'no-cheese', name: { en: 'No Cheese', es: 'Sin Queso' }, type: 'remove', default: true },
  { id: 'no-sour-cream', name: { en: 'No Sour Cream', es: 'Sin Crema' }, type: 'remove', default: true },
  { id: 'extra-cheese', name: { en: 'Extra Cheese', es: 'Extra Queso' }, type: 'add', price: 0.50 },
  { id: 'extra-sour-cream', name: { en: 'Extra Sour Cream', es: 'Extra Crema' }, type: 'add', price: 0.50 },
  { id: 'extra-guacamole', name: { en: 'Extra Guacamole', es: 'Extra Guacamole' }, type: 'add', price: 0.50 },
  { id: 'extra-jalapenos', name: { en: 'Extra Jalapeños', es: 'Extra Jalapeños' }, type: 'add', price: 0.50 },
  { id: 'extra-meat', name: { en: 'Extra Meat', es: 'Extra Carne' }, type: 'add', price: 1.00 },
  { id: 'extra-tomato', name: { en: 'Extra Tomato', es: 'Extra Tomate' }, type: 'add', price: 0.50 },
  { id: 'extra-lettuce', name: { en: 'Extra Lettuce', es: 'Extra Lechuga' }, type: 'add', price: 0.50 },
];

const mulitaCustomizations: ItemCustomization[] = [
  { id: 'meat-only', name: { en: 'Meat Only', es: 'Solo Carne' }, type: 'remove', default: false },
  { id: 'no-onion', name: { en: 'No Onion', es: 'Sin Cebolla' }, type: 'remove', default: true },
  { id: 'no-cilantro', name: { en: 'No Cilantro', es: 'Sin Cilantro' }, type: 'remove', default: true },
  { id: 'no-cheese', name: { en: 'No Cheese', es: 'Sin Queso' }, type: 'remove', default: true },
  { id: 'no-lettuce', name: { en: 'No Lettuce', es: 'Sin Lechuga' }, type: 'remove', default: true },
  { id: 'no-tomato', name: { en: 'No Tomato', es: 'Sin Tomate' }, type: 'remove', default: true },
  { id: 'no-sour-cream', name: { en: 'No Sour Cream', es: 'Sin Crema' }, type: 'remove', default: true },
  { id: 'extra-cheese', name: { en: 'Extra Cheese', es: 'Extra Queso' }, type: 'add', price: 0.50 },
  { id: 'extra-sour-cream', name: { en: 'Extra Sour Cream', es: 'Extra Crema' }, type: 'add', price: 0.50 },
  { id: 'extra-guacamole', name: { en: 'Extra Guacamole', es: 'Extra Guacamole' }, type: 'add', price: 0.50 },
  { id: 'extra-meat', name: { en: 'Extra Meat', es: 'Extra Carne' }, type: 'add', price: 1.00 },
];

const tostitacoCustomizations: ItemCustomization[] = [
  { id: 'no-lettuce', name: { en: 'No Lettuce', es: 'Sin Lechuga' }, type: 'remove', default: true },
  { id: 'no-tomato', name: { en: 'No Tomato', es: 'Sin Tomate' }, type: 'remove', default: true },
  { id: 'no-cheese', name: { en: 'No Cheese', es: 'Sin Queso' }, type: 'remove', default: true },
  { id: 'no-sour-cream', name: { en: 'No Sour Cream', es: 'Sin Crema' }, type: 'remove', default: true },
  { id: 'add-guacamole', name: { en: 'Add Guacamole', es: 'Agregar Guacamole' }, type: 'add', price: 1.50 },
  { id: 'add-jalapenos', name: { en: 'Add Jalapenos', es: 'Agregar Jalapenos' }, type: 'add', price: 0.50 },
];

// ── Menu Items (20 total) ──────────────────────────────────────────────

export const mockMenuItems: MenuItem[] = [
  // 1. TACO REGULAR - $3.00 (meat selector: full)
  {
    id: 'taco-regular',
    name: { en: 'Taco Regular', es: 'Taco Regular' },
    description: { en: 'Regular tortilla with your choice of meat and toppings', es: 'Tortilla regular con tu elección de carne y aderezos' },
    price: 3.00,
    categoryId: 'tacos',
    image: '/images/menu/tacos.JPG',
    isAvailable: true,
    isFeatured: true,
    sortOrder: 1,
    customizations: [...meatSelectFull, ...tacoCustomizations],
    createdAt: now,
    updatedAt: now,
  },

  // 2. TACO CHINGON - $5.00 (meat selector: chingon)
  {
    id: 'taco-chingon',
    name: { en: 'Taco Chingon', es: 'Taco Chingon' },
    description: { en: 'Hand-made tortilla with melted cheese, your choice of meat, and toppings', es: 'Tortilla hecha a mano con queso derretido, tu elección de carne y aderezos' },
    price: 5.00,
    categoryId: 'tacos',
    image: '/images/menu/tacos.JPG',
    isAvailable: true,
    isFeatured: true,
    sortOrder: 2,
    customizations: [...meatSelectChingon, ...tacoChingonCustomizations],
    createdAt: now,
    updatedAt: now,
  },

  // 3. TACO A MANO - $4.00 (meat selector: full)
  {
    id: 'taco-handmade',
    name: { en: 'Taco A Mano', es: 'Taco A Mano' },
    description: { en: 'Hand-made tortilla with your choice of meat and toppings', es: 'Tortilla hecha a mano con tu elección de carne y aderezos' },
    price: 4.00,
    categoryId: 'tacos',
    image: '/images/menu/tacos.JPG',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 3,
    customizations: [...meatSelectFull, ...tacoCustomizations],
    createdAt: now,
    updatedAt: now,
  },

  // 4. QUESADILLA (cheese only) - $13.00
  {
    id: 'quesadilla',
    name: { en: 'Quesadilla', es: 'Quesadilla' },
    description: { en: 'Flour tortilla with melted cheese', es: 'Tortilla de harina con queso derretido' },
    price: 13.00,
    categoryId: 'quesadillas',
    image: '/images/menu/quesadillaplain.jpg',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 1,
    customizations: quesadillaCustomizations,
    createdAt: now,
    updatedAt: now,
  },

  // 5. QUESADILLA WITH MEAT - $13.00 (meat selector)
  {
    id: 'quesadilla-meat',
    name: { en: 'Quesadilla with Meat', es: 'Quesadilla con Carne' },
    description: { en: 'Flour tortilla with cheese and your choice of meat', es: 'Tortilla de harina con queso y tu elección de carne' },
    price: 13.00,
    categoryId: 'quesadillas',
    image: '/images/menu/quesdilla.JPG',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 2,
    customizations: [...meatSelectQuesadillaMeat, ...quesadillaCustomizations],
    createdAt: now,
    updatedAt: now,
  },

  // 6. QUESABIRRIA - $8.50 (standalone)
  {
    id: 'quesabirria',
    name: { en: 'Quesabirria', es: 'Quesabirria' },
    description: { en: 'Flour tortilla with melted cheese and birria meat, served with consomé for dipping', es: 'Tortilla de harina con queso derretido y carne de birria, servida con consomé para mojar' },
    price: 8.50,
    categoryId: 'quesadillas',
    image: '/images/menu/quesabirria.jpg',
    isAvailable: true,
    isFeatured: true,
    sortOrder: 3,
    customizations: quesadillaCustomizations,
    createdAt: now,
    updatedAt: now,
  },

  // 7. FRIED QUESADILLA - $11.00 (standalone)
  {
    id: 'quesadilla-fried',
    name: { en: 'Fried Quesadilla', es: 'Quesadilla Frita' },
    description: { en: 'Fried quesadilla with melted cheese', es: 'Quesadilla frita con queso derretido' },
    price: 11.00,
    categoryId: 'quesadillas',
    image: '/images/menu/friedquesadilla.JPG',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 4,
    customizations: quesadillaCustomizations,
    createdAt: now,
    updatedAt: now,
  },

  // 7. BURRITO - $13.00 (meat selector: burrito)
  {
    id: 'burrito',
    name: { en: 'Burrito', es: 'Burrito' },
    description: { en: 'Large flour tortilla with your choice of meat, rice, beans, and toppings', es: 'Tortilla grande de harina con tu elección de carne, arroz, frijoles y aderezos' },
    price: 13.00,
    categoryId: 'burritos',
    image: '/images/menu/burrito.JPG',
    isAvailable: true,
    isFeatured: true,
    sortOrder: 1,
    customizations: [...meatSelectBurrito, ...burritoCustomizations],
    createdAt: now,
    updatedAt: now,
  },

  // 8. BEAN & CHEESE BURRITO - $13.00 (standalone)
  {
    id: 'burrito-bean-cheese',
    name: { en: 'Bean & Cheese Burrito', es: 'Burrito de Frijol y Queso' },
    description: { en: 'Large flour tortilla with beans and cheese', es: 'Tortilla grande de harina con frijoles y queso' },
    price: 13.00,
    categoryId: 'burritos',
    image: '/images/menu/burrito.JPG',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 2,
    customizations: burritoCustomizations,
    createdAt: now,
    updatedAt: now,
  },

  // 9. TORTA - $13.00 (meat selector: torta)
  {
    id: 'torta',
    name: { en: 'Torta', es: 'Torta' },
    description: { en: 'Bolillo bread with your choice of meat and toppings', es: 'Pan bolillo con tu elección de carne y aderezos' },
    price: 13.00,
    categoryId: 'tortas',
    image: '/images/menu/torta.JPG',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 1,
    customizations: [...meatSelectTorta, ...tortaCustomizations],
    createdAt: now,
    updatedAt: now,
  },

  // 10. HUARACHE - $13.00 (meat selector: huarache)
  {
    id: 'huarache',
    name: { en: 'Huarache', es: 'Huarache' },
    description: { en: 'Oval-shaped thick corn tortilla with your choice of meat and toppings', es: 'Tortilla de maíz gruesa ovalada con tu elección de carne y aderezos' },
    price: 13.00,
    categoryId: 'huaraches',
    image: '/images/menu/huarache.JPG',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 1,
    customizations: [...meatSelectHuarache, ...huaracheCustomizations],
    createdAt: now,
    updatedAt: now,
  },

  // 11. SOPE - $13.00 (meat selector: huarache/sope)
  {
    id: 'sope',
    name: { en: 'Sope', es: 'Sope' },
    description: { en: 'Thick corn base with your choice of meat and toppings', es: 'Base gruesa de maíz con tu elección de carne y aderezos' },
    price: 13.00,
    categoryId: 'sopes',
    image: '/images/menu/sopes.JPG',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 1,
    customizations: [...meatSelectHuarache, ...sopeCustomizations],
    createdAt: now,
    updatedAt: now,
  },

  // 12. LOADED FRIES - $15.00 (meat selector: fries)
  {
    id: 'loaded-fries',
    name: { en: 'Loaded Fries', es: 'Papas Cargadas' },
    description: { en: 'Crispy fries loaded with your choice of meat and toppings', es: 'Papas crujientes con tu elección de carne y aderezos' },
    price: 15.00,
    categoryId: 'fries',
    image: '/images/menu/asadafries.JPG',
    isAvailable: true,
    isFeatured: true,
    sortOrder: 1,
    customizations: [...meatSelectFries, ...friesCustomizations],
    createdAt: now,
    updatedAt: now,
  },

  // 13. TOSTITACOS - $15.00 (meat selector: tostitacos)
  {
    id: 'tostitacos',
    name: { en: 'Tostitacos', es: 'Tostitacos' },
    description: { en: 'Crispy tostada tacos with your choice of meat and toppings', es: 'Tacos en tostada crujiente con tu elección de carne y aderezos' },
    price: 15.00,
    categoryId: 'tostitacos',
    image: '/images/menu/tostilocos.webp',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 1,
    customizations: [...meatSelectTostitacos, ...tostitacoCustomizations],
    createdAt: now,
    updatedAt: now,
  },

  // 14. MULITA - $6.00 (meat selector: full)
  {
    id: 'mulita',
    name: { en: 'Mulita', es: 'Mulita' },
    description: { en: 'Two hand-made tortillas with cheese, your choice of meat, and toppings', es: 'Dos tortillas hechas a mano con queso, tu elección de carne y aderezos' },
    price: 6.00,
    categoryId: 'mulitas',
    image: '/images/menu/mulita.JPG',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 1,
    customizations: [...meatSelectFull, ...mulitaCustomizations],
    createdAt: now,
    updatedAt: now,
  },

  // 15. SODA - $1.90 (flavor selector)
  {
    id: 'soda',
    name: { en: 'Soda', es: 'Refresco' },
    description: { en: 'Cold soda, choose your flavor', es: 'Refresco frío, elige tu sabor' },
    price: 1.90,
    categoryId: 'drinks',
    image: '/images/menu/coca.JPG',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 1,
    customizations: sodaFlavorSelect,
    createdAt: now,
    updatedAt: now,
  },

  // 16. JARRITOS - $2.50 (flavor selector)
  {
    id: 'jarritos',
    name: { en: 'Jarritos', es: 'Jarritos' },
    description: { en: 'Mexican Jarritos soda, choose your flavor', es: 'Refresco Jarritos mexicano, elige tu sabor' },
    price: 2.50,
    categoryId: 'drinks',
    image: '/images/menu/jarritos.JPG',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 2,
    customizations: jarritosFlavorSelect,
    createdAt: now,
    updatedAt: now,
  },

  // 17. SALSA VERDE - $0.27
  {
    id: 'salsa-verde',
    name: { en: 'Salsa Verde', es: 'Salsa Verde' },
    description: { en: 'Green salsa made with tomatillos', es: 'Salsa verde de tomatillo' },
    price: 0.27,
    categoryId: 'extras',
    image: '/images/menu/salsa.JPEG',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  },

  // 18. SALSA ROJA - $0.25
  {
    id: 'salsa-roja',
    name: { en: 'Salsa Roja', es: 'Salsa Roja' },
    description: { en: 'Red salsa made with dried chilies', es: 'Salsa roja de chile seco' },
    price: 0.25,
    categoryId: 'extras',
    image: '/images/menu/salsa.JPEG',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  },

  // 19. SALSA GUACAMOLE - $0.25
  {
    id: 'salsa-guacamole',
    name: { en: 'Salsa Guacamole', es: 'Salsa Guacamole' },
    description: { en: 'Fresh guacamole salsa', es: 'Salsa de guacamole fresco' },
    price: 0.25,
    categoryId: 'extras',
    image: '/images/menu/salsa.JPEG',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 3,
    createdAt: now,
    updatedAt: now,
  },
];

// Helper functions
export const getFeaturedItems = () => mockMenuItems.filter(item => item.isFeatured);
export const getItemsByCategory = (categoryId: string) => mockMenuItems.filter(item => item.categoryId === categoryId);
export const getAvailableItems = () => mockMenuItems.filter(item => item.isAvailable);

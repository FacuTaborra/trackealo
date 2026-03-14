import {
  IconPizza,
  IconCar,
  IconHome,
  IconPlane,
  IconBook,
  IconMusic,
  IconDeviceGamepad2,
  IconShoppingCart,
  IconStethoscope,
  IconSchool,
  IconGift,
  IconCoffee,
  IconShirt,
  IconGasStation,
  IconDeviceMobile,
  IconTools,
  IconCoin,
  IconReceipt,
  IconTag
} from '@tabler/icons-react';
const NONE_VALUE = '__none__';

export const CATEGORY_ICON_OPTIONS = [
  { value: NONE_VALUE, label: 'Sin icono', Icon: null },
  { value: 'IconPizza', label: 'Comida', Icon: IconPizza },
  { value: 'IconCar', label: 'Transporte', Icon: IconCar },
  { value: 'IconHome', label: 'Hogar', Icon: IconHome },
  { value: 'IconPlane', label: 'Viajes', Icon: IconPlane },
  { value: 'IconBook', label: 'Educación', Icon: IconBook },
  { value: 'IconMusic', label: 'Entretenimiento', Icon: IconMusic },
  { value: 'IconDeviceGamepad2', label: 'Juegos', Icon: IconDeviceGamepad2 },
  { value: 'IconShoppingCart', label: 'Compras', Icon: IconShoppingCart },
  { value: 'IconStethoscope', label: 'Salud', Icon: IconStethoscope },
  { value: 'IconSchool', label: 'Estudios', Icon: IconSchool },
  { value: 'IconGift', label: 'Regalos', Icon: IconGift },
  { value: 'IconCoffee', label: 'Café / Bebidas', Icon: IconCoffee },
  { value: 'IconShirt', label: 'Ropa', Icon: IconShirt },
  { value: 'IconGasStation', label: 'Combustible', Icon: IconGasStation },
  { value: 'IconDeviceMobile', label: 'Tecnología', Icon: IconDeviceMobile },
  { value: 'IconTools', label: 'Mantenimiento', Icon: IconTools },
  { value: 'IconCoin', label: 'Ahorro', Icon: IconCoin },
  { value: 'IconReceipt', label: 'Facturas', Icon: IconReceipt },
  { value: 'IconTag', label: 'Otros', Icon: IconTag }
] as const;

export type CategoryIconValue = (typeof CATEGORY_ICON_OPTIONS)[number]['value'];

const iconMap = Object.fromEntries(
  CATEGORY_ICON_OPTIONS.filter((o) => o.Icon).map((o) => [o.value, o.Icon])
) as Record<string, React.ComponentType<{ className?: string }>>;

export function getCategoryIcon(iconName: string | null | undefined) {
  if (!iconName || iconName === NONE_VALUE) return null;
  return iconMap[iconName] ?? null;
}

export const CATEGORY_COLOR_OPTIONS = [
  { value: NONE_VALUE, label: 'Sin color' },
  { value: '#ef4444', label: 'Rojo' },
  { value: '#f97316', label: 'Naranja' },
  { value: '#eab308', label: 'Amarillo' },
  { value: '#22c55e', label: 'Verde' },
  { value: '#14b8a6', label: 'Turquesa' },
  { value: '#06b6d4', label: 'Cian' },
  { value: '#3b82f6', label: 'Azul' },
  { value: '#8b5cf6', label: 'Violeta' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#6b7280', label: 'Gris' }
] as const;

export { NONE_VALUE };

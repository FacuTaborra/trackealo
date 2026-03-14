import { NavItem } from '@/types';

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Transacciones',
    url: '/dashboard/transactions',
    icon: 'billing',
    shortcut: ['t', 't'],
    isActive: false,
    items: []
  },
  {
    title: 'Cuentas',
    url: '/dashboard/accounts',
    icon: 'billing',
    shortcut: ['c', 'c'],
    isActive: false,
    items: []
  },
  {
    title: 'Categorías',
    url: '/dashboard/categories',
    icon: 'tag',
    shortcut: ['k', 'k'],
    isActive: false,
    items: []
  },
  {
    title: 'Cuenta',
    url: '#',
    icon: 'billing',
    isActive: false,
    items: [
      {
        title: 'Perfil',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'API Keys',
        url: '/dashboard/api-keys',
        icon: 'settings',
        shortcut: ['a', 'k']
      }
    ]
  }
];

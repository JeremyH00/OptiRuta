import type { Plan } from '@/types';

export const PLANS: Plan[] = [
  {
    tier: 'Básico',
    monthlyPrice: 149000,
    routeLimit: 10,
    vehicleLimit: 5,
    features: [
      'Optimización básica de rutas',
      'Hasta 5 vehículos',
      'Hasta 10 rutas/mes',
      'Dashboard de seguimiento',
      'Soporte por email (48h)',
    ],
  },
  {
    tier: 'Pro',
    monthlyPrice: 349000,
    routeLimit: 50,
    vehicleLimit: 20,
    features: [
      'Optimización avanzada con tráfico en tiempo real',
      'Hasta 20 vehículos',
      'Hasta 50 rutas/mes',
      'API REST + Webhooks',
      'Reportes avanzados',
      'Soporte prioritario (8h)',
    ],
  },
  {
    tier: 'Enterprise',
    monthlyPrice: 0,
    routeLimit: -1,
    vehicleLimit: -1,
    features: [
      'Vehículos y rutas ilimitados',
      'Integraciones custom (ERP / TMS)',
      'SLA 99.9% de disponibilidad',
      'Gerente de cuenta dedicado',
      'Capacitación in-situ',
      'Soporte 24/7',
    ],
  },
];

export function formatPrice(price: number): string {
  if (price === 0) return 'Precio personalizado';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
}

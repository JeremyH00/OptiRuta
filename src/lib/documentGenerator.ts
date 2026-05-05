import type { Lead, Contract } from '@/types';
import { PLANS, formatPrice } from '@/constants/plans';
import { formatDate } from './dateUtils';

export interface GeneratedDoc {
  id: string;
  title: string;
  content: string;
}

export function generateDocuments(lead: Lead, contract: Contract): GeneratedDoc[] {
  const plan = PLANS.find(p => p.tier === contract.selectedPlan) ?? PLANS[0];
  const titular = contract.titular;
  const today = formatDate(new Date().toISOString());
  const docs: GeneratedDoc[] = [];

  docs.push({
    id: 'main_contract',
    title: 'Contrato de Servicio',
    content: `CONTRATO DE PRESTACIÓN DE SERVICIOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sistema Inteligente de Rutas de Entrega "OPTIRUTA"
Versión 1.0 | Fecha: ${today}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PARTES DEL CONTRATO

PRESTADOR: OptiRuta SAS, identificada con NIT 900.XXX.XXX-X, con domicilio
en Bogotá D.C., Colombia (en adelante "OPTIRUTA").

CLIENTE: ${titular?.fullName ?? lead.companyName}
${titular ? `${titular.idType}: ${titular.idNumber}` : ''}
Empresa: ${lead.companyName}
Email: ${lead.contactEmail}
Teléfono: ${lead.contactPhone}
${titular ? `Dirección: ${titular.address}, ${titular.city}` : ''}

OBJETO DEL CONTRATO

Por medio del presente contrato, OPTIRUTA se compromete a prestar al CLIENTE
los servicios de optimización inteligente de rutas de entrega descritos en el
Plan ${plan.tier}, que incluye:
${plan.features.map(f => `  • ${f}`).join('\n')}

VALOR Y CONDICIONES ECONÓMICAS

Plan contratado: ${plan.tier}
Valor mensual: ${formatPrice(contract.agreedPrice ?? plan.monthlyPrice)}
Ciclo de facturación: ${contract.paymentPlan?.billingCycle === 'annual' ? 'Anual' : contract.paymentPlan?.billingCycle === 'quarterly' ? 'Trimestral' : 'Mensual'}
Fecha de inicio: ${contract.contractStartDate ? formatDate(contract.contractStartDate) : 'A definir'}

DURACIÓN

El presente contrato tendrá una duración inicial de doce (12) meses contados
a partir de la fecha de activación, renovándose automáticamente por períodos
iguales salvo que alguna de las partes notifique su terminación con treinta
(30) días de antelación.

OBLIGACIONES DE OPTIRUTA

1. Garantizar la disponibilidad del servicio conforme al SLA acordado.
2. Proporcionar soporte técnico según el plan contratado.
3. Mantener la confidencialidad de los datos del CLIENTE.
4. Notificar al CLIENTE sobre cambios de versión con al menos 15 días de anticipación.

OBLIGACIONES DEL CLIENTE

1. Pagar oportunamente los valores acordados.
2. Usar el servicio conforme a los términos de uso.
3. Reportar incidencias a través de los canales oficiales.
4. Mantener actualizados sus datos de contacto y facturación.

FIRMA

Este contrato se entiende aceptado con la firma de las partes.

_______________________________     ______________________________
${titular?.fullName ?? 'Representante Legal Cliente'}    Representante Legal OptiRuta
${lead.companyName}                 OptiRuta SAS
Fecha: ${today}                     Fecha: ${today}
`,
  });

  docs.push({
    id: 'sla_annex',
    title: 'Anexo SLA – Acuerdo de Niveles de Servicio',
    content: `ANEXO A – ACUERDO DE NIVELES DE SERVICIO (SLA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Plan: ${plan.tier} | Cliente: ${lead.companyName}
Fecha: ${today}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DISPONIBILIDAD DEL SERVICIO

${plan.tier === 'Enterprise' ? '• Disponibilidad garantizada: 99.9% mensual' : plan.tier === 'Pro' ? '• Disponibilidad garantizada: 99.5% mensual' : '• Disponibilidad garantizada: 99.0% mensual'}
• Ventana de mantenimiento programado: Domingos 2:00 AM – 4:00 AM (hora Colombia)
• Notificación de mantenimiento con mínimo 48 horas de anticipación

TIEMPOS DE RESPUESTA SOPORTE

${plan.tier === 'Enterprise' ? '• P1 – Crítico: 1 hora (24/7)\n• P2 – Alto: 4 horas (24/7)\n• P3 – Medio: 8 horas hábiles\n• P4 – Bajo: 2 días hábiles' :
  plan.tier === 'Pro' ? '• P1 – Crítico: 4 horas hábiles\n• P2 – Alto: 8 horas hábiles\n• P3 – Medio: 2 días hábiles\n• P4 – Bajo: 5 días hábiles' :
  '• P1 – Crítico: 24 horas hábiles\n• P2 – Alto: 48 horas hábiles\n• P3/P4 – Medio/Bajo: 5 días hábiles'}

COMPENSACIONES

En caso de incumplimiento del SLA de disponibilidad:
• 1-2% de indisponibilidad adicional: 5% de crédito en la siguiente factura
• 2-5% de indisponibilidad adicional: 10% de crédito en la siguiente factura
• >5% de indisponibilidad adicional: 20% de crédito en la siguiente factura

LIMITACIONES

El SLA no aplica en casos de fuerza mayor, interrupciones de proveedores de
infraestructura de nube, o incidencias causadas por el cliente.
`,
  });

  docs.push({
    id: 'data_protection',
    title: 'Política de Protección de Datos',
    content: `ANEXO B – POLÍTICA DE PROTECCIÓN DE DATOS PERSONALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ley 1581 de 2012 (Colombia) | Decreto 1377 de 2013
Fecha: ${today}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESPONSABLE DEL TRATAMIENTO

OptiRuta SAS actúa como Responsable del Tratamiento de los datos personales
proporcionados por el CLIENTE y sus usuarios en la plataforma.

DATOS RECOLECTADOS

• Datos de identificación: nombre, documento de identidad
• Datos de contacto: email, teléfono, dirección
• Datos de uso: rutas generadas, patrones de entrega, historiales de optimización
• Datos de facturación: información de pago (almacenada de forma cifrada)

FINALIDADES DEL TRATAMIENTO

1. Prestación del servicio de optimización de rutas
2. Facturación y gestión del contrato
3. Soporte técnico y atención al cliente
4. Mejoras del servicio mediante análisis agregado (anonimizado)
5. Cumplimiento de obligaciones legales

DERECHOS DEL TITULAR

El CLIENTE y sus usuarios tienen derecho a:
• Conocer, actualizar y rectificar sus datos
• Solicitar prueba de la autorización
• Revocar la autorización
• Presentar quejas ante la Superintendencia de Industria y Comercio

Para ejercer estos derechos: privacidad@optiruta.co

TRANSFERENCIAS INTERNACIONALES

Los datos pueden ser procesados en servidores ubicados en EE.UU. (AWS)
bajo las garantías del Escudo de Privacidad y cláusulas contractuales tipo.

El CLIENTE declara haber leído y aceptado esta política.
`,
  });

  if (contract.hasCoDebtor && contract.coDebtor) {
    const cd = contract.coDebtor;
    docs.push({
      id: 'codebtor_addendum',
      title: 'Adendo – Codeudor / Aval',
      content: `ADENDO DE CODEUDORÍA / AVAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contrato principal: ${lead.companyName}
Fecha: ${today}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IDENTIFICACIÓN DEL CODEUDOR

Nombre: ${cd.fullName}
${cd.idType}: ${cd.idNumber}
Email: ${cd.email}
Teléfono: ${cd.phone}
Dirección: ${cd.address}, ${cd.city}
Relación con el titular: ${cd.relationship}

DECLARACIÓN DE CODEUDORÍA

Yo, ${cd.fullName}, identificado(a) como aparece al margen, declaro que:

1. Conozco y acepto todas las condiciones del contrato de servicio suscrito
   por ${lead.companyName} con OptiRuta SAS.

2. Me comprometo solidariamente con el CLIENTE al cumplimiento de todas
   las obligaciones económicas derivadas del contrato, especialmente el
   pago oportuno de las cuotas de suscripción.

3. Acepto que OptiRuta SAS puede hacer efectiva esta codeudoría de manera
   directa en caso de incumplimiento del CLIENTE.

_______________________________
${cd.fullName}
${cd.idType}: ${cd.idNumber}
Fecha: ${today}
`,
    });
  }

  return docs;
}

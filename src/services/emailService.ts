import { Report } from '../types';

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '';
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_NOTIFICATION_EMAIL || 'admin@tuempresa.com';

export interface EmailResult {
  success: boolean;
  message: string;
}

export async function sendAdminNotificationEmail(report: Report): Promise<EmailResult> {
  const isConfigured = Boolean(WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY.length > 5);

  const subjectMap: Record<string, string> = {
    queja: '🔴 [NUEVA QUEJA]',
    sugerencia: '💡 [NUEVA SUGERENCIA]',
    felicitacion: '⭐ [NUEVA FELICITACIÓN]',
    etica: '⚠️ [REPORTE DE ÉTICA]',
  };

  const subjectPrefix = subjectMap[report.tipo] || '📬 [NUEVO REPORTE]';
  const emailSubject = `${subjectPrefix} Folio ${report.folio}: ${report.asunto}`;

  const messageBody = `
===================================================
📬 NUEVO REPORTE EN EL BUZÓN ANÓNIMO DE QUEJAS Y SUGERENCIAS
===================================================

• Folio de Seguimiento: ${report.folio}
• Tipo de Reporte: ${report.tipo.toUpperCase()}
• Categoría: ${report.categoria}
• Urgencia: ${report.urgencia.toUpperCase()}
• Fecha de Envío: ${new Date(report.fecha_creacion).toLocaleString('es-MX')}

---------------------------------------------------
ASUNTO:
${report.asunto}

DESCRIPCIÓN DETALLADA:
${report.descripcion}

${report.adjunto ? `EVIDENCIA ADJUNTA: ${report.adjunto}` : ''}
---------------------------------------------------

Para revisar o cambiar el estado de este reporte, ingresa al Panel de Administración de tu Buzón de Quejas.
`;

  // Si no está configurada la llave de Web3Forms, simulamos el envío exitoso para pruebas locales
  if (!isConfigured) {
    console.log('📬 [MODO SIMULACIÓN CORREO]: Notificación generada para el administrador:');
    console.log(`Para: ${ADMIN_EMAIL}`);
    console.log(`Asunto: ${emailSubject}`);
    console.log(`Cuerpo:\n${messageBody}`);
    return {
      success: true,
      message: 'Notificación simulada correctamente (Configura VITE_WEB3FORMS_ACCESS_KEY para recepción en bandeja real).'
    };
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: emailSubject,
        from_name: 'Buzón Anónimo de Quejas',
        to_email: ADMIN_EMAIL,
        message: messageBody,
        folio: report.folio,
        tipo: report.tipo,
        urgencia: report.urgencia,
      })
    });

    const data = await response.json();
    if (data.success) {
      return { success: true, message: 'Correo de notificación enviado exitosamente al administrador.' };
    } else {
      console.warn('Error en API Web3Forms:', data.message);
      return { success: false, message: data.message || 'No se pudo enviar el correo de notificación.' };
    }
  } catch (error) {
    console.error('Error al enviar correo por Web3Forms:', error);
    return { success: false, message: 'Error de red al intentar enviar la notificación por correo.' };
  }
}

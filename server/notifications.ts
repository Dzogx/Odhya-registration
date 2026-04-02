/**
 * Notification Services
 * Handles sending emails and SMS messages
 */

import { createNotification, updateNotificationStatus } from "./db";

// Email Service
export async function sendEmailNotification(
  registrationId: number,
  recipient: string,
  subject: string,
  message: string
) {
  try {
    // Create notification record
    await createNotification({
      registrationId,
      type: "email",
      recipient,
      subject,
      message,
      status: "pending",
    });

    // In a real implementation, this would integrate with an email service
    // like SendGrid, AWS SES, or Mailgun
    // For now, we'll log it and mark as sent
    console.log(`[Email] Sending to ${recipient}: ${subject}`);
    
    // Simulate sending
    await updateNotificationStatus(1, "sent");
    
    return { success: true };
  } catch (error) {
    console.error("[Email] Error sending notification:", error);
    await createNotification({
      registrationId,
      type: "email",
      recipient,
      subject,
      message,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// SMS Service
export async function sendSMSNotification(
  registrationId: number,
  phoneNumber: string,
  message: string
) {
  try {
    // Create notification record
    await createNotification({
      registrationId,
      type: "sms",
      recipient: phoneNumber,
      message,
      status: "pending",
    });

    // In a real implementation, this would integrate with an SMS service
    // like Twilio, AWS SNS, or local SMS gateway
    // For now, we'll log it and mark as sent
    console.log(`[SMS] Sending to ${phoneNumber}: ${message}`);
    
    // Simulate sending
    await updateNotificationStatus(1, "sent");
    
    return { success: true };
  } catch (error) {
    console.error("[SMS] Error sending notification:", error);
    await createNotification({
      registrationId,
      type: "sms",
      recipient: phoneNumber,
      message,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Send Registration Confirmation Email
export async function sendRegistrationConfirmationEmail(
  registrationId: number,
  fullName: string,
  email: string
) {
  const subject = "تأكيد التسجيل في برنامج الأضاحي";
  const message = `
السلام عليكم ورحمة الله وبركاته

${fullName}

تم استقبال طلبك للتسجيل في برنامج الأضاحي بنجاح.
سيتم مراجعة بيانات طلبك والتواصل معك قريباً للتأكيد.

شكراً لك على تعاونك
بلدية العالية - ولاية توڨرت
  `.trim();

  return sendEmailNotification(registrationId, email, subject, message);
}

// Send Registration Confirmation SMS
export async function sendRegistrationConfirmationSMS(
  registrationId: number,
  fullName: string,
  phoneNumber: string
) {
  const message = `السلام عليكم ${fullName}
تم استقبال طلبك للتسجيل في برنامج الأضاحي. سيتم التواصل معك قريباً.
بلدية العالية`;

  return sendSMSNotification(registrationId, phoneNumber, message);
}

// Send Status Change Notification Email
export async function sendStatusChangeEmail(
  registrationId: number,
  fullName: string,
  email: string,
  newStatus: string,
  statusLabel: string
) {
  const subject = `تحديث حالة طلب الأضاحي - ${statusLabel}`;
  const message = `
السلام عليكم ورحمة الله وبركاته

${fullName}

تم تحديث حالة طلبك إلى: ${statusLabel}

رقم الطلب: #${registrationId}

شكراً لك على تعاونك
بلدية العالية - ولاية توڨرت
  `.trim();

  return sendEmailNotification(registrationId, email, subject, message);
}

// Send Status Change Notification SMS
export async function sendStatusChangeSMS(
  registrationId: number,
  fullName: string,
  phoneNumber: string,
  statusLabel: string
) {
  const message = `${fullName}
تم تحديث حالة طلبك إلى: ${statusLabel}
بلدية العالية`;

  return sendSMSNotification(registrationId, phoneNumber, message);
}

// Send Admin Notification Email
export async function sendAdminNotificationEmail(
  registrationId: number,
  adminEmail: string,
  registrationData: any
) {
  const subject = `طلب تسجيل جديد - #${registrationId}`;
  const message = `
طلب تسجيل جديد في برنامج الأضاحي:

الاسم: ${registrationData.fullName}
الهاتف: ${registrationData.phoneNumber}
البريد الإلكتروني: ${registrationData.email || "غير محدد"}
العنوان: ${registrationData.address}
عدد الأضاحي: ${registrationData.ramCount}
التاريخ: ${new Date(registrationData.createdAt).toLocaleDateString("ar-SA")}

الرجاء مراجعة الطلب في لوحة التحكم
  `.trim();

  return sendEmailNotification(registrationId, adminEmail, subject, message);
}

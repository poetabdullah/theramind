// src/services/emailService.js
import { functions } from '../firebaseConfig';

/**
 * Sends an email notification using Firebase Cloud Functions
 * @param {Object} emailData - Email content and metadata
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.text - Plain text email content
 * @param {string} [emailData.html] - HTML email content (optional)
 * @returns {Promise} Resolves when email is sent successfully
 */
export const sendEmailNotification = async ({ to, subject, text, html }) => {
  try {
    // Call the Firebase Cloud Function
    const sendEmail = functions.httpsCallable('sendEmailNotification');
    const result = await sendEmail({
      to,
      subject,
      text,
      html: html || text // Fallback to text if html not provided
    });

    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email notification');
  }
};

/**
 * Sends a templated email for common admin actions
 * @param {string} recipientEmail - Email address of the recipient
 * @param {string} actionType - Type of action (approval, rejection, etc.)
 * @param {string} userType - Type of user (doctor, patient)
 * @param {Object} [additionalData] - Additional template data
 * @returns {Promise} Resolves when email is sent successfully
 */
export const sendTemplatedAdminEmail = async (recipientEmail, actionType, userType, additionalData = {}) => {
  const templates = {
    doctor_approval: {
      subject: 'Your Doctor Application Has Been Approved',
      text: `Dear Doctor ${additionalData.name || ''},\n\nWe are pleased to inform you that your application has been approved. You can now log in to your account and start receiving patients.\n\nRegards,\nThe Admin Team`
    },
    doctor_rejection: {
      subject: 'Your Doctor Application Has Been Reviewed',
      text: `Dear ${additionalData.name || 'Applicant'},\n\nAfter careful consideration, we regret to inform you that your application has not been approved at this time.\n\nReason: ${additionalData.reason || 'Not specified'}\n\nRegards,\nThe Admin Team`
    },
    patient_block: {
      subject: 'Your Account Has Been Temporarily Blocked',
      text: `Dear ${additionalData.name || 'User'},\n\nYour account has been temporarily blocked by the administrator. You will not be able to access your account during this time.\n\nReason: ${additionalData.reason || 'Not specified'}\n\nRegards,\nThe Admin Team`
    },
    patient_unblock: {
      subject: 'Your Account Has Been Reactivated',
      text: `Dear ${additionalData.name || 'User'},\n\nYour account has been reactivated. You can now log in and use the platform normally.\n\nRegards,\nThe Admin Team`
    },
    account_deletion: {
      subject: 'Your Account Has Been Deleted',
      text: `Dear ${additionalData.name || 'User'},\n\nYour account has been permanently deleted by the administrator.\n\nRegards,\nThe Admin Team`
    }
  };

  const templateKey = `${userType}_${actionType}`;
  const template = templates[templateKey] || {
    subject: 'Notification from Admin',
    text: `Dear ${additionalData.name || 'User'},\n\nThis is to inform you about an action taken on your account.\n\nAction: ${actionType}\n\nRegards,\nThe Admin Team`
  };

  return sendEmailNotification({
    to: recipientEmail,
    subject: template.subject,
    text: template.text,
    ...additionalData.html && { html: additionalData.html }
  });
};
export default sendEmailNotification;
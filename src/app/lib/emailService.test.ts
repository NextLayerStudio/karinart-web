// Example usage of the email service
// This file is for demonstration purposes only

import { sendEmail, EmailData } from './emailService';

// Example function to send a confirmation email
export async function sendConfirmationEmail(
  clientEmail: string,
  clientName: string,
  appointmentDateTime: string,
  customMessage?: string
) {
  const emailData: EmailData = {
    type: 'confirmed',
    to: clientEmail,
    name: clientName,
    datetime: appointmentDateTime,
    message: customMessage
  };

  const result = await sendEmail(emailData);
  
  if (result.success) {
    console.log('Confirmation email sent successfully');
  } else {
    console.error('Failed to send confirmation email:', result.error);
  }
  
  return result;
}

// Example function to send a received notification
export async function sendReceivedNotification(
  clientEmail: string,
  clientName: string,
  appointmentDateTime: string
) {
  const emailData: EmailData = {
    type: 'received',
    to: clientEmail,
    name: clientName,
    datetime: appointmentDateTime
  };

  return await sendEmail(emailData);
}

// Example function to send a reschedule notification
export async function sendRescheduleNotification(
  clientEmail: string,
  clientName: string,
  newAppointmentDateTime: string,
  reason?: string
) {
  const emailData: EmailData = {
    type: 'rescheduled',
    to: clientEmail,
    name: clientName,
    datetime: newAppointmentDateTime,
    message: reason
  };

  return await sendEmail(emailData);
}

// Example function to send a decline notification
export async function sendDeclineNotification(
  clientEmail: string,
  clientName: string,
  appointmentDateTime: string,
  reason?: string
) {
  const emailData: EmailData = {
    type: 'declined',
    to: clientEmail,
    name: clientName,
    datetime: appointmentDateTime,
    message: reason
  };

  return await sendEmail(emailData);
}

// Example function to send internal notice to Karin
export async function sendInternalNotice(
  clientName: string,
  appointmentDateTime: string,
  appointmentDetails: string
) {
  const emailData: EmailData = {
    type: 'internal_notice',
    to: 'info@karinart.sk',
    name: clientName,
    datetime: appointmentDateTime,
    message: appointmentDetails
  };

  return await sendEmail(emailData);
}

// Example API call using fetch
export async function sendEmailViaAPI(emailData: EmailData) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Email sent via API:', result.message);
      return { success: true };
    } else {
      console.error('API error:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Network error:', error);
    return { success: false, error: 'Network error' };
  }
} 
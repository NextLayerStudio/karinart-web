# Email Service Setup for Karin Art

This document explains how to set up and use the email service for the Karin Art tattoo booking system.

## Environment Variables

Add the following variables to your `.env.local` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.m1.websupport.sk
SMTP_PORT=465
SMTP_USER=info@karinart.sk
SMTP_PASS=RVe#v[&`p9L|Mojp-Kwc
```

## API Endpoint

### POST `/api/send-email`

Sends emails to clients for appointment notifications.

#### Request Body

```typescript
{
  type: 'received' | 'confirmed' | 'rescheduled' | 'declined' | 'internal_notice';
  to: string;           // Client's email address
  name: string;         // Client's full name
  datetime: string;     // Appointment date/time
  message?: string;     // Optional custom message
}
```

#### Response

**Success (200):**
```json
{
  "message": "Email sent successfully"
}
```

**Error (400/500):**
```json
{
  "error": "Error description"
}
```

## Email Types

### 1. Received (`type: "received"`)
- **Subject:** "Vaša rezervácia bola prijatá"
- **Body:** "Dobrý deň [MENO], Vaša žiadosť o rezerváciu na [DÁTUM + ČAS] bola úspešne prijatá. Karin sa Vám čoskoro ozve ohľadom potvrdenia termínu. Ďakujeme za prejavenú dôveru. S pozdravom, Karin Art."

### 2. Internal Notice (`type: "internal_notice"`)
- **Subject:** "Nová žiadosť o termín"
- **Body:** "Bola prijatá nová žiadosť o termín od klienta [MENO], na dátum [DÁTUM + ČAS]."

### 3. Confirmed (`type: "confirmed"`)
- **Subject:** "Vaša rezervácia bola potvrdená"
- **Body:** "Dobrý deň [MENO], Vaša rezervácia na termín [DÁTUM + ČAS] bola potvrdená. Tešíme sa na Vašu návštevu. V prípade otázok nás neváhajte kontaktovať. S pozdravom, Karin Art."

### 4. Rescheduled (`type: "rescheduled"`)
- **Subject:** "Zmena rezervácie"
- **Body:** "Dobrý deň [MENO], Vaša rezervácia bola upravená. Nový termín je [DÁTUM + ČAS]. Pokiaľ Vám nový termín nevyhovuje, prosím, dajte nám vedieť. S pozdravom, Karin Art."

### 5. Declined (`type: "declined"`)
- **Subject:** "Rezervácia nebola potvrdená"
- **Body:** "Dobrý deň [MENO], žiaľ, Vaša žiadosť o termín [DÁTUM + ČAS] nemohla byť potvrdená z organizačných dôvodov. Môžete si skúsiť vybrať iný termín prostredníctvom formulára. S pozdravom, Karin Art."

## Usage Examples

### Using the API directly:

```typescript
const response = await fetch('/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'confirmed',
    to: 'client@example.com',
    name: 'John Doe',
    datetime: '2024-01-15 14:30',
    message: 'Prosím, príďte 10 minút pred termínom.'
  }),
});

const result = await response.json();
```

### Using the email service utility:

```typescript
import { sendEmail } from '@/app/lib/emailService';

const result = await sendEmail({
  type: 'received',
  to: 'client@example.com',
  name: 'John Doe',
  datetime: '2024-01-15 14:30'
});

if (result.success) {
  console.log('Email sent successfully');
} else {
  console.error('Failed to send email:', result.error);
}
```

## Integration with Appointment System

You can integrate this email service with your appointment management system:

1. **When a new appointment is created:** Send a "received" email to client and "internal_notice" to Karin
2. **When an appointment is confirmed:** Send a "confirmed" email
3. **When an appointment is rescheduled:** Send a "rescheduled" email
4. **When an appointment is declined:** Send a "declined" email

### Example integration in appointment confirmation:

```typescript
// In your appointment confirmation handler
async function confirmAppointment(appointmentId: string) {
  // ... update appointment status in database
  
  // Send confirmation email
  const appointment = await getAppointment(appointmentId);
  await sendEmail({
    type: 'confirmed',
    to: appointment.clientEmail,
    name: appointment.clientName,
    datetime: appointment.appointmentDateTime
  });
}
```

### Example integration in appointment decline:

```typescript
// In your appointment decline handler
async function declineAppointment(appointmentId: string, reason?: string) {
  // ... update appointment status in database
  
  // Send decline email
  const appointment = await getAppointment(appointmentId);
  await sendEmail({
    type: 'declined',
    to: appointment.clientEmail,
    name: appointment.clientName,
    datetime: appointment.appointmentDateTime,
    message: reason
  });
}
```

## Security Notes

- The email service is server-side only and cannot be called directly from the client
- SMTP credentials are stored in environment variables
- All email content is validated before sending
- The service includes proper error handling and logging

## Troubleshooting

1. **"Email service not configured"** - Check that SMTP_USER and SMTP_PASS are set in .env.local
2. **"Failed to send email"** - Check SMTP server settings and credentials
3. **"Invalid request data"** - Ensure all required fields are provided and valid

## Testing

You can test the email service by making a POST request to `/api/send-email` with valid data. Make sure to use a real email address for testing. 
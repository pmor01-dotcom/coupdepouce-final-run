// lib/email.ts

// Example email functions — keep your real implementations here

export async function sendNewDemandNotification(
  email: string,
  senderName: string,
  demandTitle: string
) {
  // your existing email logic
  console.log("Sending demand notification:", email, senderName, demandTitle);
  return true;
}

export async function sendPasswordResetEmail(email: string, token: string) {
  // your existing email logic
  console.log("Sending password reset:", email, token);
  return true;
}

export async function sendWelcomeEmail(email: string, name: string) {
  // your existing email logic
  console.log("Sending welcome email:", email, name);
  return true;
}

// ⭐ THIS IS THE PART YOU WERE MISSING ⭐
// Default export so routes can do: import EmailService from '@/lib/email'

const EmailService = {
  sendNewDemandNotification,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};

export default EmailService;

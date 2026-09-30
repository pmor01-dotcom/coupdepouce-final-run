import { Resend } from "resend";

console.log('=== EMAIL.TS INITIALIZATION ===');
console.log('RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);
console.log('RESEND_API_KEY value starts with:', process.env.RESEND_API_KEY?.substring(0, 10));

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

console.log('Resend client initialized:', !!resend);

const getAppUrl = () => process.env.APP_URL || "https://www.coupdepouce-aide.com";
const getCurrentYear = () => new Date().getFullYear();

export class EmailService {
  static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      if (!resend) {
        console.error("Resend API key not configured");
        return false;
      }

      // Use Resend's default from email for testing if custom domain not verified
      const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';
      const fromName = process.env.RESEND_FROM_NAME || 'Coup de Pouce';

      console.log('=== EMAIL SERVICE DEBUG ===');
      console.log('From email:', from);
      console.log('From name:', fromName);
      console.log('To email:', to);
      console.log('Subject:', subject);

      const result = await resend.emails.send({
        from: `${fromName} <${from}>`,
        to,
        subject,
        html,
      });

      console.log("Resend email result:", result);
      return true;
    } catch (error) {
      console.error("Resend email error:", error);
      console.error("Email error details:", JSON.stringify(error, null, 2));
      return false;
    }
  }

  static async sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to bottom, #6B8E23, #D4E4BC); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Coup de Pouce</h1>
          <p style="color: white; margin: 5px 0 0;">Réinitialisation de mot de passe</p>
        </div>
        <div style="background: white; padding: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${name},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getAppUrl()}/reset-password?token=${resetToken}"
               style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© ${getCurrentYear()} Coup de Pouce. Tous droits réservés.</p>
        </div>
      </div>
    `;

    return this.sendEmail(to, "Réinitialisation de votre mot de passe", html);
  }

  static async sendNewProposalEmail(
    to: string,
    clientName: string,
    artisanName: string,
    artisanMetier: string,
    demandTitle: string,
    proposedPrice: string,
    message: string
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to bottom, #6B8E23, #D4E4BC); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Coup de Pouce</h1>
          <p style="color: white; margin: 5px 0 0;">Nouvelle proposition pour votre demande</p>
        </div>
        <div style="background: white; padding: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${clientName},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Vous avez reçu une nouvelle proposition pour votre demande : <strong>${demandTitle}</strong>
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Détails de l'artisan</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Nom :</strong> ${artisanName}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Métier :</strong> ${artisanMetier}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Prix proposé :</strong> ${proposedPrice}</p>
          </div>
          <div style="margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">Message de l'artisan :</h3>
            <p style="color: #666; line-height: 1.6; background: #f8f9fa; padding: 15px; border-radius: 5px;">
              ${message}
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getAppUrl()}/client-dashboard/demandes"
               style="background: #6B8E23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Voir mes demandes
            </a>
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© ${getCurrentYear()} Coup de Pouce. Tous droits réservés.</p>
        </div>
      </div>
    `;

    return this.sendEmail(to, "Nouvelle proposition reçue", html);
  }

  static async sendNewMessageEmail(
    to: string,
    receiverName: string,
    senderName: string,
    senderRole: string,
    messageContent: string
  ): Promise<boolean> {
    const roleText = senderRole === 'artisan' ? 'artisan' : 'client';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to bottom, #6B8E23, #D4E4BC); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Coup de Pouce</h1>
          <p style="color: white; margin: 5px 0 0;">Nouveau message reçu</p>
        </div>
        <div style="background: white; padding: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${receiverName},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Vous avez reçu un nouveau message de <strong>${senderName}</strong> (${roleText})
          </p>
          <div style="margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">Message :</h3>
            <p style="color: #666; line-height: 1.6; background: #f8f9fa; padding: 15px; border-radius: 5px;">
              ${messageContent}
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getAppUrl()}/login?redirect=%2Fmessages"
               style="background: #6B8E23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Voir mes messages
            </a>
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© ${getCurrentYear()} Coup de Pouce. Tous droits réservés.</p>
        </div>
      </div>
    `;

    return this.sendEmail(to, "Nouveau message reçu", html);
  }
}

export default EmailService;

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const getAppUrl = () => process.env.APP_URL || "https://www.coupdepouce-aide.com";
const getCurrentYear = () => new Date().getFullYear();

export class EmailService {
  static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      if (!resend) {
        console.error("Resend API key not configured");
        return false;
      }

      // IMPORTANT: Use the ONLY mailbox that actually exists in IONOS
      const from = process.env.EMAIL_FROM || "info@coupdepouce-aide.com";

      const result = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      console.log("Resend email result:", result);
      return true;
    } catch (error) {
      console.error("Resend email error:", error);
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
}

export default EmailService;

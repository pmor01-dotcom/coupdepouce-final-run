import nodemailer from 'nodemailer'

// Helper to get app URL - deferred to runtime
const getAppUrl = () => process.env.APP_URL || 'http://localhost:3000'
const getCurrentYear = () => new Date().getFullYear()

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Bienvenue sur Coup de Pouce !',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to bottom, #6B8E23, #D4E4BC); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Coup de Pouce</h1>
          <p style="color: white; margin: 5px 0 0;">La plateforme de confiance pour vos projets</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Bienvenue ${name} !</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Nous sommes ravis de vous accueillir sur Coup de Pouce ! Votre compte a été créé avec succès.
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Que vous soyez client ou artisan, vous pouvez maintenant :
          </p>
          <ul style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            <li>Publier ou répondre à des demandes de services</li>
            <li>Communiquer directement avec des professionnels</li>
            <li>Gérer vos projets et vos collaborations</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getAppUrl()}/login" 
               style="background: #6B8E23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Me connecter
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© ${getCurrentYear()} Coup de Pouce. Tous droits réservés.</p>
          <p>123 Rue de la République, 75001 Paris, France</p>
        </div>
      </div>
    `,
  }),

  passwordReset: (name: string, resetToken: string) => ({
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to bottom, #6B8E23, #D4E4BC); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Coup de Pouce</h1>
          <p style="color: white; margin: 5px 0 0;">Réinitialisation de mot de passe</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${name},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getAppUrl()}/reset-password?token=${resetToken}" 
               style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Ce lien expirera dans 1 heure pour des raisons de sécurité.
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© ${getCurrentYear()} Coup de Pouce. Tous droits réservés.</p>
          <p>123 Rue de la République, 75001 Paris, France</p>
        </div>
      </div>
    `,
  }),

  paymentConfirmation: (name: string, planType: string, amount: string) => ({
    subject: 'Confirmation de votre abonnement Coup de Pouce',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to bottom, #6B8E23, #D4E4BC); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Coup de Pouce</h1>
          <p style="color: white; margin: 5px 0 0;">Confirmation d'abonnement</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Félicitations ${name} !</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Votre abonnement ${planType === 'monthly' ? 'mensuel' : 'annuel'} a été activé avec succès.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Détails de l'abonnement :</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Plan :</strong> ${planType === 'monthly' ? 'Mensuel' : 'Annuel'}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Montant :</strong> ${amount}€</p>
            <p style="color: #666; margin: 5px 0;"><strong>Statut :</strong> Actif</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Vous pouvez maintenant accéder à toutes les fonctionnalités de votre tableau de bord artisan :
          </p>
          <ul style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            <li>Accès illimité aux demandes clients</li>
            <li>Profil artisan vérifié</li>
            <li>Statistiques et rapports</li>
            <li>Support prioritaire</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getAppUrl()}/artisan-dashboard" 
               style="background: #6B8E23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Accéder à mon tableau de bord
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© ${getCurrentYear()} Coup de Pouce. Tous droits réservés.</p>
          <p>123 Rue de la République, 75001 Paris, France</p>
        </div>
      </div>
    `,
  }),

  newMessage: (recipientName: string, senderName: string, demandTitle: string) => ({
    subject: `Nouveau message de ${senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to bottom, #6B8E23, #D4E4BC); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Coup de Pouce</h1>
          <p style="color: white; margin: 5px 0 0;">Nouveau message</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${recipientName},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Vous avez reçu un nouveau message de <strong>${senderName}</strong> concernant votre demande :
          </p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #333; margin: 0; font-style: italic;">"${demandTitle}"</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Connectez-vous à votre tableau de bord pour lire le message et répondre.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getAppUrl()}/dashboard" 
               style="background: #6B8E23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Voir le message
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© ${getCurrentYear()} Coup de Pouce. Tous droits réservés.</p>
          <p>123 Rue de la République, 75001 Paris, France</p>
        </div>
      </div>
    `,
  }),

  newProposal: (artisanName: string, demandTitle: string, clientName: string) => ({
    subject: `Nouvelle proposition pour votre demande : ${demandTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to bottom, #6B8E23, #D4E4BC); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Coup de Pouce</h1>
          <p style="color: white; margin: 5px 0 0;">Nouvelle proposition</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${clientName},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Bonne nouvelle ! <strong>${artisanName}</strong> a fait une proposition pour votre demande :
          </p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #333; margin: 0; font-style: italic;">"${demandTitle}"</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Connectez-vous à votre tableau de bord pour consulter la proposition et prendre contact avec l'artisan.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getAppUrl()}/client-dashboard" 
               style="background: #6B8E23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Voir la proposition
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© ${getCurrentYear()} Coup de Pouce. Tous droits réservés.</p>
          <p>123 Rue de la République, 75001 Paris, France</p>
        </div>
      </div>
    `,
  }),
  newDemandNotification: (
    artisanName: string,
    clientName: string,
    demandTitle: string,
    demandDescription: string,
    location: string,
    department: string,
    budgetRange: string,
    urgency: string
  ) => ({
    subject: `Nouvelle demande dans votre département : ${demandTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to bottom, #6B8E23, #D4E4BC); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Coup de Pouce</h1>
          <p style="color: white; margin: 5px 0 0;">Nouvelle demande disponible</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${artisanName},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Une nouvelle demande vient d'être publiée dans votre département (${department}).
          </p>
          <h3 style="color: #333; margin-bottom: 10px;">${demandTitle}</h3>
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">${demandDescription}</p>
          <table style="width:100%; border-collapse: collapse; color: #666; margin-bottom: 20px;">
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Client</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${clientName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Lieu</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${location}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Département</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${department}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Budget</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${budgetRange}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Urgence</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${urgency}</td></tr>
          </table>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getAppUrl()}/artisan-dashboard" 
               style="background: #6B8E23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Voir la demande
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© ${getCurrentYear()} Coup de Pouce. Tous droits réservés.</p>
        </div>
      </div>
    `,
  }),
  newSignupNotification: (user: {
    name: string
    email: string
    role: string
    location?: string | null
    department?: string | null
    metier?: string | null
    phone?: string | null
  }) => ({
    subject: `Nouvelle inscription sur Coup de Pouce : ${user.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to bottom, #6B8E23, #D4E4BC); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Coup de Pouce</h1>
          <p style="color: white; margin: 5px 0 0;">Nouvelle inscription</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Un nouvel utilisateur vient de s'inscrire</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Voici les détails de l'inscription :
          </p>
          <table style="width:100%; border-collapse: collapse; color: #666;">
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Nom</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${user.name}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${user.email}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Rôle</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${user.role}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Localisation</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${user.location || 'Non spécifié'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Département</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${user.department || 'Non spécifié'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Métier</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${user.metier || 'Non spécifié'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Téléphone</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${user.phone || 'Non spécifié'}</td></tr>
          </table>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getAppUrl()}/login" 
               style="background: #6B8E23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Voir le site
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© ${getCurrentYear()} Coup de Pouce. Tous droits réservés.</p>
        </div>
      </div>
    `,
  }),
}

// Email service class
export class EmailService {
  static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('Missing SMTP credentials: SMTP_USER and SMTP_PASSWORD are required')
      return false
    }

    try {
      // Create transporter lazily at send time to avoid initializing during build
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      })

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@coupdepouce.com',
        to,
        subject,
        html,
      }

      await transporter.sendMail(mailOptions)
      console.log(`Email sent successfully to ${to}`)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  static async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const template = emailTemplates.welcome(name)
    return this.sendEmail(to, template.subject, template.html)
  }

  static async sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<boolean> {
    const template = emailTemplates.passwordReset(name, resetToken)
    return this.sendEmail(to, template.subject, template.html)
  }

  static async sendPaymentConfirmationEmail(to: string, name: string, planType: string, amount: string): Promise<boolean> {
    const template = emailTemplates.paymentConfirmation(name, planType, amount)
    return this.sendEmail(to, template.subject, template.html)
  }

  static async sendNewMessageEmail(to: string, recipientName: string, senderName: string, demandTitle: string): Promise<boolean> {
    const template = emailTemplates.newMessage(recipientName, senderName, demandTitle)
    return this.sendEmail(to, template.subject, template.html)
  }

  static async sendNewProposalEmail(to: string, artisanName: string, demandTitle: string, clientName: string): Promise<boolean> {
    const template = emailTemplates.newProposal(artisanName, demandTitle, clientName)
    return this.sendEmail(to, template.subject, template.html)
  }

  static async sendNewDemandNotification(
    to: string,
    artisanName: string,
    clientName: string,
    demandTitle: string,
    demandDescription: string,
    location: string,
    department: string,
    budgetRange: string,
    urgency: string
  ): Promise<boolean> {
    const template = emailTemplates.newDemandNotification(
      artisanName,
      clientName,
      demandTitle,
      demandDescription,
      location,
      department,
      budgetRange,
      urgency
    )
    return this.sendEmail(to, template.subject, template.html)
  }

  static async sendNewSignupNotification(
    to: string,
    user: {
      name: string
      email: string
      role: string
      location?: string | null
      department?: string | null
      metier?: string | null
      phone?: string | null
    }
  ): Promise<boolean> {
    const template = emailTemplates.newSignupNotification(user)
    return this.sendEmail(to, template.subject, template.html)
  }
}

export default EmailService

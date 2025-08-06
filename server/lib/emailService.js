// Email service abstraction
// This can be easily replaced with SendGrid, Resend, NodeMailer, etc.

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'console'; // 'console', 'sendgrid', 'resend', etc.
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@golfevents.com';
    
    if (this.provider === 'sendgrid') {
      this.apiKey = process.env.SENDGRID_API_KEY;
    } else if (this.provider === 'resend') {
      this.apiKey = process.env.RESEND_API_KEY;
    }
  }

  async sendInvitationEmail({ to, playerName, eventName, eventStartDate, eventLocation, invitationLink }) {
    const subject = `You're invited to ${eventName}`;
    const textContent = `
Hi ${playerName},

You've been invited to participate in the golf event "${eventName}".

Click the link below to accept your invitation and create your account:
${invitationLink}

Event Details:
- Event: ${eventName}
- Start Date: ${eventStartDate ? new Date(eventStartDate).toLocaleDateString() : 'TBD'}
- Location: ${eventLocation || 'TBD'}

We look forward to seeing you on the course!

Best regards,
The Golf Event Team
    `.trim();

    const htmlContent = textContent.replace(/\n/g, '<br>');

    try {
      if (this.provider === 'console') {
        // Development mode - just log the email
        console.log('📧 INVITATION EMAIL TO SEND:');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Content:');
        console.log(textContent);
        console.log('---');
        
        // Simulate async email sending
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return { success: true, messageId: `console-${Date.now()}` };
      } 
      
      else if (this.provider === 'sendgrid') {
        // SendGrid implementation
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(this.apiKey);
        
        const msg = {
          to,
          from: this.fromEmail,
          subject,
          text: textContent,
          html: htmlContent
        };
        
        const response = await sgMail.send(msg);
        return { success: true, messageId: response[0].headers['x-message-id'] };
      }
      
      else if (this.provider === 'resend') {
        // Resend implementation
        const { Resend } = require('resend');
        const resend = new Resend(this.apiKey);
        
        const response = await resend.emails.send({
          from: this.fromEmail,
          to,
          subject,
          text: textContent,
          html: htmlContent
        });
        
        return { success: true, messageId: response.id };
      }
      
      else {
        throw new Error(`Unsupported email provider: ${this.provider}`);
      }
    } catch (error) {
      console.error(`Email send failed (${this.provider}):`, error);
      return { success: false, error: error.message };
    }
  }
}

export { EmailService };

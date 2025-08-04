import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // ===== ETHEREAL EMAIL (TESTING) - CURRENTLY ACTIVE =====
    // Perfect for testing - no real credentials needed
    // No real emails sent, perfect for testing and demos
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.ETHEREAL_USER || 'test@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'test123',
      },
    });

    // ===== GMAIL SMTP (REAL EMAILS) - COMMENTED FOR EASY SWITCHING =====
    // Uncomment the lines below and comment out the Ethereal config above to use Gmail
    // Real emails sent to users for password reset and notifications
    // Perfect for school projects - no 2FA required
    
    /*
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD, // Regular password for school project
        // For production with 2FA: use GMAIL_APP_PASSWORD instead
      },
    });
    */
  }

  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    userType: 'voter' | 'admin'
  ): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      // ===== GMAIL SMTP (REAL EMAILS) =====
      from: process.env.GMAIL_USER,
      
      // ===== ETHEREAL EMAIL (TESTING) =====
      // Uncomment the line below and comment out the Gmail line above to use Ethereal
      // from: process.env.ETHEREAL_USER || 'test@ethereal.email',
      
      to: to,
      subject: 'Password Reset Request - Voting System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0;">🔐 Password Reset Request</h2>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
            <p style="color: #666; margin-bottom: 20px;">
              Hello ${userType === 'voter' ? 'Voter' : 'Admin'},
            </p>
            
            <p style="color: #333; margin-bottom: 20px;">
              We received a request to reset your password for the Voting System. 
              If you didn't make this request, you can safely ignore this email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block; 
                        font-weight: bold;">
                Reset Your Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #007bff; font-size: 12px; word-break: break-all; 
                       background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
              ${resetLink}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                <strong>Important:</strong>
              </p>
              <ul style="color: #666; font-size: 12px; margin: 10px 0;">
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>For security, this link can only be used once</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This is an automated message from the Voting System.</p>
            <p>If you have any questions, please contact your system administrator.</p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${to}`);
      
      // ===== GMAIL SMTP (REAL EMAILS) =====
      console.log(`📧 Real email sent via Gmail to ${to}`);
      
      // ===== ETHEREAL EMAIL (TESTING) =====
      // Uncomment the line below and comment out the Gmail line above for Ethereal
      // console.log(`📧 Ethereal Email URL: ${nodemailer.getTestMessageUrl(info)}`);
      
      return info;
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendPasswordChangedEmail(to: string, userType: 'voter' | 'admin'): Promise<void> {
    const mailOptions = {
      // ===== GMAIL SMTP (REAL EMAILS) =====
      from: process.env.GMAIL_USER,
      
      // ===== ETHEREAL EMAIL (TESTING) =====
      // Uncomment the line below and comment out the Gmail line above to use Ethereal
      // from: process.env.ETHEREAL_USER || 'test@ethereal.email',
      
      to: to,
      subject: 'Password Successfully Changed - Voting System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #155724; margin: 0;">✅ Password Successfully Changed</h2>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
            <p style="color: #666; margin-bottom: 20px;">
              Hello ${userType === 'voter' ? 'Voter' : 'Admin'},
            </p>
            
            <p style="color: #333; margin-bottom: 20px;">
              Your password has been successfully changed. If you did not make this change, 
              please contact your system administrator immediately.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                <strong>Security Notice:</strong> If you did not change your password, 
                please contact your system administrator as soon as possible.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This is an automated message from the Voting System.</p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password changed confirmation email sent to ${to}`);
      
      // ===== GMAIL SMTP (REAL EMAILS) =====
      console.log(`📧 Real confirmation email sent via Gmail to ${to}`);
      
      // ===== ETHEREAL EMAIL (TESTING) =====
      // Uncomment the line below and comment out the Gmail line above for Ethereal
      // console.log(`📧 Ethereal Email URL: ${nodemailer.getTestMessageUrl(info)}`);
      
      return info;
    } catch (error) {
      console.error('❌ Error sending password changed email:', error);
      // Don't throw error for confirmation emails as they're not critical
    }
  }

  // Test email connection and get credentials
  async testConnection(): Promise<boolean> {
    try {
      // ===== GMAIL SMTP (REAL EMAILS) =====
      console.log('✅ Testing Gmail SMTP connection...');
      console.log(`📧 Gmail User: ${process.env.GMAIL_USER}`);
      console.log(`🔑 Gmail Password: ${process.env.GMAIL_PASSWORD ? '***configured***' : 'NOT CONFIGURED'}`);
      
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD,
        },
      });

      // ===== ETHEREAL EMAIL (TESTING) =====
      // Uncomment the lines below and comment out the Gmail lines above to test Ethereal
      /*
      const testAccount = await nodemailer.createTestAccount();
      console.log('✅ Ethereal test account created');
      console.log(`📧 Test Email: ${testAccount.user}`);
      console.log(`🔑 Test Password: ${testAccount.pass}`);
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      */

      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
} 
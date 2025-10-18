"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let EmailService = class EmailService {
    constructor() {
        console.log('📧 Initializing email service...');
        console.log('📧 EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'sendgrid');
        console.log('📧 FRONTEND_URL:', process.env.FRONTEND_URL ? 'Set' : 'Not set');
        const emailService = process.env.EMAIL_SERVICE || 'sendgrid';
        console.log(`🔍 Debug - ${emailService.toUpperCase()} environment variables:`);
        console.log('🔍 SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set' : 'Not set');
        if (!process.env.SENDGRID_API_KEY) {
            console.error('❌ SendGrid configuration missing! SENDGRID_API_KEY must be set.');
            console.error('⚠️ Email functionality will be disabled. App will continue to run without email features.');
            console.error('🔧 To fix: Set SENDGRID_API_KEY environment variable in your deployment platform.');
            this.transporter = null;
            return;
        }
        this.transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY,
            },
        });
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('❌ SendGrid verification failed:', error);
            }
            else {
                console.log('✅ SendGrid verified successfully');
            }
        });
    }
    async sendPasswordResetEmail(to, resetToken, userType, userName, userId) {
        if (!this.transporter) {
            console.error('❌ Email service not configured - cannot send password reset email');
            throw new Error('Email service not configured. Please contact administrator.');
        }
        if (!process.env.FRONTEND_URL) {
            console.error('❌ FRONTEND_URL environment variable is not set');
            throw new Error('Frontend URL not configured. Please contact administrator.');
        }
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&type=${userType}`;
        const mailOptions = {
            from: 'BallotBlitz Voting System <adea.votingsys@gmail.com>',
            to: to,
            subject: 'Password Reset Request for Ballotblitz',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0;">🔐 Password Reset Request</h2>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
            <p style="color: #666; margin-bottom: 20px;">
              Hello ${userName || (userType === 'voter' ? 'Voter' : 'Admin')} ${userId ? `(${userId})` : ''},
            </p>
            
            <p style="color: #333; margin-bottom: 20px;">
              We received a request to reset your password for Ballotblitz. 
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
            <p>This is an automated message from Ballotblitz.</p>
            <p>If you have any questions, please contact your system administrator.</p>
          </div>
        </div>
      `,
        };
        try {
            console.log(`📧 Attempting to send password reset email to ${to}`);
            console.log(`🔗 Reset link: ${resetLink}`);
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Password reset email sent successfully to ${to}`);
            console.log(`📧 Message ID: ${info.messageId}`);
            console.log(`📧 Response: ${info.response}`);
            return info;
        }
        catch (error) {
            console.error('❌ Error sending password reset email:', error);
            console.error('❌ SendGrid Error details:', {
                code: error.code,
                command: error.command,
                response: error.response,
                responseCode: error.responseCode
            });
            throw new Error('Failed to send password reset email');
        }
    }
    async sendPasswordChangedEmail(to, userType) {
        if (!this.transporter) {
            console.error('❌ Email service not configured - cannot send password changed email');
            throw new Error('Email service not configured. Please contact administrator.');
        }
        const mailOptions = {
            from: 'BallotBlitz Voting System <adea.votingsys@gmail.com>',
            to: to,
            subject: 'Password Changed Successfully - Ballotblitz',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #28a745; margin: 0;">✅ Password Changed Successfully</h2>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
            <p style="color: #666; margin-bottom: 20px;">
              Hello ${userType === 'voter' ? 'Voter' : 'Admin'},
            </p>
            
            <p style="color: #333; margin-bottom: 20px;">
              Your password has been successfully changed for your Ballotblitz account.
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
            console.log(`📧 Real confirmation email sent via SendGrid to ${to}`);
            return info;
        }
        catch (error) {
            console.error('❌ Error sending password changed email:', error);
        }
    }
    async testConnection() {
        try {
            console.log(`✅ Testing SendGrid connection...`);
            console.log(`📧 SendGrid API Key: ${process.env.SENDGRID_API_KEY ? '***configured***' : 'NOT CONFIGURED'}`);
            if (!this.transporter) {
                console.error('❌ SendGrid transporter not initialized');
                return false;
            }
            const isVerified = await this.transporter.verify();
            if (isVerified) {
                console.log('✅ SendGrid connection test successful');
                return true;
            }
            else {
                console.error('❌ SendGrid connection test failed');
                return false;
            }
        }
        catch (error) {
            console.error('❌ SendGrid connection test error:', error);
            return false;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map
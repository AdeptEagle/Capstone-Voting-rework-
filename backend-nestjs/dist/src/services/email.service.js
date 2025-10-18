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
const axios_1 = require("axios");
let EmailService = class EmailService {
    constructor() {
        this.useApiService = false;
        this.apiService = '';
        console.log('📧 Initializing email service...');
        console.log('📧 EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'brevo');
        console.log('📧 FRONTEND_URL:', process.env.FRONTEND_URL ? 'Set' : 'Not set');
        const emailService = process.env.EMAIL_SERVICE || 'brevo';
        console.log(`🔍 Debug - ${emailService.toUpperCase()} environment variables:`);
        if (emailService === 'resend') {
            this.useApiService = true;
            this.apiService = 'resend';
            console.log('🔍 RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');
            console.log('🔍 RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL ? 'Set' : 'Not set');
        }
        else if (emailService === 'brevo') {
            console.log('🔍 BREVO_SMTP_LOGIN:', process.env.BREVO_SMTP_LOGIN ? 'Set' : 'Not set');
            console.log('🔍 BREVO_SMTP_KEY:', process.env.BREVO_SMTP_KEY ? 'Set' : 'Not set');
            console.log('🔍 BREVO_SENDER_EMAIL:', process.env.BREVO_SENDER_EMAIL ? 'Set' : 'Not set');
        }
        else if (emailService === 'gmail') {
            console.log('🔍 GMAIL_USER:', process.env.GMAIL_USER ? 'Set' : 'Not set');
            console.log('🔍 GMAIL_PASSWORD:', process.env.GMAIL_PASSWORD ? 'Set' : 'Not set');
        }
        else if (emailService === 'sendgrid') {
            console.log('🔍 SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set' : 'Not set');
        }
        if (emailService === 'resend') {
            if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
                console.error('❌ Resend configuration missing! RESEND_API_KEY and RESEND_FROM_EMAIL must be set.');
                console.error('⚠️ Email functionality will be disabled. App will continue to run without email features.');
                console.error('🔧 To fix: Set RESEND_API_KEY and RESEND_FROM_EMAIL environment variables in your deployment platform.');
                this.transporter = null;
                return;
            }
            console.log('✅ Resend API configuration found - using API service');
            this.transporter = null;
        }
        else if (emailService === 'gmail') {
            if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
                console.error('❌ Gmail configuration missing! GMAIL_USER and GMAIL_PASSWORD must be set.');
                console.error('⚠️ Email functionality will be disabled. App will continue to run without email features.');
                console.error('🔧 To fix: Set GMAIL_USER and GMAIL_PASSWORD environment variables in your deployment platform.');
                this.transporter = null;
                return;
            }
            this.transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_PASSWORD,
                },
                tls: {
                    rejectUnauthorized: false
                },
                connectionTimeout: 60000,
                greetingTimeout: 30000,
                socketTimeout: 60000,
            });
        }
        else if (emailService === 'brevo') {
            if (!process.env.BREVO_SMTP_KEY || !process.env.BREVO_SMTP_LOGIN) {
                console.error('❌ Brevo configuration missing! BREVO_SMTP_KEY and BREVO_SMTP_LOGIN must be set.');
                console.error('⚠️ Email functionality will be disabled. App will continue to run without email features.');
                console.error('🔧 To fix: Set BREVO_SMTP_KEY and BREVO_SMTP_LOGIN environment variables in your deployment platform.');
                this.transporter = null;
                return;
            }
            const smtpConfigs = [
                {
                    host: 'smtp-relay.brevo.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.BREVO_SMTP_LOGIN,
                        pass: process.env.BREVO_SMTP_KEY,
                    },
                    tls: {
                        rejectUnauthorized: false
                    },
                    connectionTimeout: 30000,
                    greetingTimeout: 15000,
                    socketTimeout: 30000,
                },
                {
                    host: 'smtp-relay.brevo.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.BREVO_SMTP_LOGIN,
                        pass: process.env.BREVO_SMTP_KEY,
                    },
                    tls: {
                        rejectUnauthorized: false
                    },
                    connectionTimeout: 30000,
                    greetingTimeout: 15000,
                    socketTimeout: 30000,
                }
            ];
            console.log(`🔧 Creating Brevo SMTP transporter (port 587)...`);
            this.transporter = nodemailer.createTransport(smtpConfigs[0]);
            console.log(`✅ Brevo SMTP transporter created successfully!`);
        }
        else if (emailService === 'sendgrid') {
            if (!process.env.SENDGRID_API_KEY) {
                console.error('❌ SendGrid configuration missing! SENDGRID_API_KEY must be set.');
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
        }
        else {
            console.error(`❌ Unsupported email service: ${emailService}`);
            this.transporter = null;
            return;
        }
        if (this.transporter && !this.useApiService) {
            this.transporter.verify((error, success) => {
                if (error) {
                    console.error('❌ Email service verification failed:', error);
                }
                else {
                    console.log('✅ Email service verified successfully');
                }
            });
        }
        else if (this.useApiService) {
            console.log('✅ API email service configured - no SMTP verification needed');
        }
    }
    async sendEmailViaResend(to, subject, html, text) {
        try {
            const response = await axios_1.default.post('https://api.resend.com/emails', {
                from: process.env.RESEND_FROM_EMAIL,
                to: [to],
                subject: subject,
                html: html,
                text: text || html.replace(/<[^>]*>/g, ''),
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('✅ Email sent via Resend API:', response.data);
        }
        catch (error) {
            console.error('❌ Resend API error:', error.response?.data || error.message);
            throw new Error(`Failed to send email via Resend: ${error.response?.data?.message || error.message}`);
        }
    }
    async sendPasswordResetEmail(to, resetToken, userType, userName, userId) {
        if (!this.transporter && !this.useApiService) {
            console.error('❌ Email service not configured - cannot send password reset email');
            throw new Error('Email service not configured. Please contact administrator.');
        }
        if (!process.env.FRONTEND_URL) {
            console.error('❌ FRONTEND_URL environment variable is not set');
            throw new Error('Frontend URL not configured. Please contact administrator.');
        }
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const senderEmail = process.env.BREVO_SMTP_LOGIN || process.env.BREVO_SENDER_EMAIL;
        console.log(`📧 Sender email configuration:`);
        console.log(`📧 BREVO_SMTP_LOGIN: ${process.env.BREVO_SMTP_LOGIN || 'Not set'}`);
        console.log(`📧 BREVO_SENDER_EMAIL: ${process.env.BREVO_SENDER_EMAIL || 'Not set'}`);
        console.log(`📧 Final sender: ${senderEmail || 'NOT CONFIGURED'}`);
        if (!senderEmail) {
            console.error('❌ No sender email configured! Set BREVO_SMTP_LOGIN or BREVO_SENDER_EMAIL');
            throw new Error('Sender email not configured. Please set BREVO_SMTP_LOGIN or BREVO_SENDER_EMAIL environment variable.');
        }
        const mailOptions = {
            from: senderEmail,
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
            if (this.useApiService && this.apiService === 'resend') {
                await this.sendEmailViaResend(to, mailOptions.subject, mailOptions.html);
                console.log(`✅ Password reset email sent successfully via Resend API to ${to}`);
            }
            else {
                const info = await this.transporter.sendMail(mailOptions);
                console.log(`✅ Password reset email sent successfully to ${to}`);
                console.log(`📧 Message ID: ${info.messageId}`);
                console.log(`📧 Response: ${info.response}`);
                return info;
            }
        }
        catch (error) {
            console.error('❌ Error sending password reset email:', error);
            if (this.useApiService) {
                console.error('❌ API Error details:', error.message);
            }
            else {
                console.error('❌ SMTP Error details:', {
                    code: error.code,
                    command: error.command,
                    response: error.response,
                    responseCode: error.responseCode
                });
            }
            throw new Error('Failed to send password reset email');
        }
    }
    async sendPasswordChangedEmail(to, userType) {
        if (!this.transporter && !this.useApiService) {
            console.error('❌ Email service not configured - cannot send password changed email');
            throw new Error('Email service not configured. Please contact administrator.');
        }
        const senderEmail = process.env.BREVO_SMTP_LOGIN || process.env.BREVO_SENDER_EMAIL;
        if (!senderEmail) {
            console.error('❌ No sender email configured for password changed email!');
            throw new Error('Sender email not configured. Please set BREVO_SMTP_LOGIN or BREVO_SENDER_EMAIL environment variable.');
        }
        const mailOptions = {
            from: senderEmail,
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
            if (this.useApiService && this.apiService === 'resend') {
                await this.sendEmailViaResend(to, mailOptions.subject, mailOptions.html);
                console.log(`✅ Password changed confirmation email sent via Resend API to ${to}`);
            }
            else {
                const info = await this.transporter.sendMail(mailOptions);
                console.log(`✅ Password changed confirmation email sent to ${to}`);
                console.log(`📧 Real confirmation email sent via ${process.env.EMAIL_SERVICE || 'brevo'} to ${to}`);
                return info;
            }
        }
        catch (error) {
            console.error('❌ Error sending password changed email:', error);
        }
    }
    async testConnection() {
        try {
            const emailService = process.env.EMAIL_SERVICE || 'brevo';
            console.log(`✅ Testing ${emailService.toUpperCase()} SMTP connection...`);
            if (emailService === 'brevo') {
                console.log(`📧 Brevo Login: ${process.env.BREVO_SMTP_LOGIN}`);
                console.log(`🔑 Brevo Key: ${process.env.BREVO_SMTP_KEY ? '***configured***' : 'NOT CONFIGURED'}`);
                const configs = [
                    { port: 587, secure: false },
                    { port: 465, secure: true }
                ];
                for (const config of configs) {
                    try {
                        console.log(`🔧 Testing Brevo SMTP on port ${config.port}...`);
                        this.transporter = nodemailer.createTransport({
                            host: 'smtp-relay.brevo.com',
                            port: config.port,
                            secure: config.secure,
                            auth: {
                                user: process.env.BREVO_SMTP_LOGIN,
                                pass: process.env.BREVO_SMTP_KEY,
                            },
                            tls: {
                                rejectUnauthorized: false
                            },
                            connectionTimeout: 30000,
                            greetingTimeout: 15000,
                            socketTimeout: 30000,
                        });
                        await this.transporter.verify();
                        console.log(`✅ Brevo SMTP port ${config.port} working!`);
                        break;
                    }
                    catch (error) {
                        console.log(`❌ Port ${config.port} failed:`, error.message);
                        if (config === configs[configs.length - 1]) {
                            throw error;
                        }
                    }
                }
            }
            else if (emailService === 'gmail') {
                console.log(`📧 Gmail User: ${process.env.GMAIL_USER}`);
                console.log(`🔑 Gmail Password: ${process.env.GMAIL_PASSWORD ? '***configured***' : 'NOT CONFIGURED'}`);
                this.transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_PASSWORD,
                    },
                });
            }
            await this.transporter.verify();
            console.log('✅ Email service connection verified');
            return true;
        }
        catch (error) {
            console.error('❌ Email service connection failed:', error);
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
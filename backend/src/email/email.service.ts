import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined in environment variables');
    }
    this.resend = new Resend(apiKey);
  }

  // Generic method to send an email (single or multiple recipients)
  async sendEmail(to: string | string[], subject: string, html: string) {
    const recipients = Array.isArray(to) ? to : [to];
    const response = await this.resend.emails.send({
      from: 'TechKnows | Technology & Programming Blogs<info@sudipsharma.com.np>',
      to: recipients,
      subject,
      html,
    });
    // Check for error in response (Resend returns { error } on failure)
    if (response.error) {
      const errorMsg =
        typeof response.error?.message === 'string'
          ? response.error.message
          : JSON.stringify(response.error);
      throw new Error(`Failed to send email: ${errorMsg}`);
    }
    return response;
  }

  // Onboarding Email Template
  private onboardingTemplate(userEmail: string, loginTime: string, ipAddress?: string) {
    return `
			<div style="font-family: Arial, sans-serif;">
				<h2>Login Alert</h2>
				<p>Hello,</p>
				<p>Your account <b>${userEmail}</b> was just logged in at <b>${loginTime}</b>${ipAddress ? ` from IP: <b>${ipAddress}</b>` : ''}.</p>
				<p>If this was not you, please reset your password immediately.</p>
				<p>Thank you,<br/>Your Team</p>
			</div>
		`;
  }

  // Forgot Password (OTP) Email Template
  private forgotPasswordTemplate(userEmail: string, otp: string) {
    return `
			<div style="font-family: Arial, sans-serif;">
				<h2>Password Reset Request</h2>
				<p>Hello,</p>
				<p>We received a request to reset the password for <b>${userEmail}</b>.</p>
				<p>Your OTP code is:</p>
				<h3 style="color: #2d3748;">${otp}</h3>
				<p>This code is valid for <b>5 minutes</b>.</p>
				<p>If you did not request this, please ignore this email.</p>
				<p>Thank you,<br/>Your Team</p>
			</div>
		`;
  }

  // Verification Email Link Template
  private verificationEmailTemplate(userEmail: string, verifyLink: string) {
    return `
			<div style="font-family: Arial, sans-serif;">
				<h2>Email Verification</h2>
				<p>Hello,</p>
				<p>Thank you for registering with <b>${userEmail}</b>.</p>
				<p>Please verify your email by clicking the link below:</p>
				<a href="${verifyLink}" style="background: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Verify Email</a>
				<p>This link is valid for <b>5 minutes</b>.</p>
				<p>If you did not create an account, please ignore this email.</p>
				<p>Thank you,<br/>Your Team</p>
			</div>
		`;
  }

  // Send Onboarding/Login Alert Email
  async sendOnboardingEmail(to: string | string[], loginTime: string, ipAddress?: string) {
    const subject = 'Login Alert - Your Account';
    const html = this.onboardingTemplate(Array.isArray(to) ? to[0] : to, loginTime, ipAddress);
    return this.sendEmail(to, subject, html);
  }

  // Send Forgot Password Email (with OTP)
  async sendForgotPasswordEmail(to: string | string[], otp: string) {
    const subject = 'Password Reset Request';
    const html = this.forgotPasswordTemplate(Array.isArray(to) ? to[0] : to, otp);
    return this.sendEmail(to, subject, html);
  }

  // Send Verification Email Link
  async sendVerificationEmail(to: string | string[], verifyLink: string) {
    const subject = 'Verify Your Email Address';
    const html = this.verificationEmailTemplate(Array.isArray(to) ? to[0] : to, verifyLink);
    return this.sendEmail(to, subject, html);
  }
}

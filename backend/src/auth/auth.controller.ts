import { Body, Controller, Post, Get, Req, Res, UseGuards, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './auth.dto';
import { JwtService } from '../jwt/jwt.service';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RedisOnlyGuard, RedisPrismaGuard } from 'src/common/health-check.guard';
import { ConfigService } from '@nestjs/config';
import { AlreadyAuthenticatedGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly FRONTEND_URL: string;

  constructor(
    private readonly authService: AuthService,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.FRONTEND_URL = this.configService.get<string>('FRONTEND_URL') || '';
    if (!this.FRONTEND_URL) {
      throw new Error('FRONTEND_URL is not defined in environment variables');
    }
  }
  @UseGuards(AlreadyAuthenticatedGuard)
  @UseGuards(RedisPrismaGuard)
  @Post('login')
  async login(
    @Body() authDto: AuthDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const context = {
        ipAddress: this.extractClientIp(req),
        userAgent: this.extractUserAgent(req),
      };
      const result = await this.authService.login({
        ...authDto,
        ...context,
      });
      if (result && 'accessToken' in result && 'refreshToken' in result) {
        await this.jwt.setAuthCookies(response, result.accessToken, result.refreshToken);
        return {
          status: result.status,
          message: result.message,
          user: result.user,
        };
      }
      return {
        status: result?.status,
        message: result?.message,
      };
    } catch (error) {
      let status = 400;
      let message = 'Login failed';
      if (typeof error === 'object' && error !== null) {
        const errObj = error as { status?: number; message?: string };
        if (typeof errObj.status === 'number') status = errObj.status;
        if (typeof errObj.message === 'string') message = errObj.message;
      }
      return { status, message };
    }
  }

  // Google OAuth
  @Get('google')
  // @UseGuards(AlreadyAuthenticatedGuard)
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @UseGuards(RedisPrismaGuard)
  async googleAuthCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      if (!req.user) {
        res.redirect(
          `${this.FRONTEND_URL}/?status=400&message=${encodeURIComponent('No user found in request')}`,
        );
        return;
      }
      const userFromStrategy = req.user;
      const context = {
        ipAddress: this.extractClientIp(req),
        userAgent: this.extractUserAgent(req),
      };
      const result = await this.authService.login({
        ...(userFromStrategy as AuthDto),
        ...context,
      });
      if (
        result &&
        'accessToken' in result &&
        'refreshToken' in result &&
        'user' in result &&
        'userToken' in result
      ) {
        await this.jwt.setAuthCookies(res, result.accessToken, result.refreshToken);
        res.redirect(
          `${this.FRONTEND_URL}/?status=${result.status}&message=${encodeURIComponent(result.message)}&user=${encodeURIComponent(result.userToken)}`,
        );
      }
      res.redirect(
        `${this.FRONTEND_URL}/?status=${result?.status}&message=${encodeURIComponent(result?.message || 'Login failed')}`,
      );
    } catch (error: unknown) {
      let status = 400;
      let message = 'Google authentication failed';
      if (typeof error === 'object' && error !== null) {
        const errObj = error as { status?: number; message?: string };
        if (typeof errObj.status === 'number') status = errObj.status;
        if (typeof errObj.message === 'string') message = errObj.message;
      }
      res.redirect(`${this.FRONTEND_URL}/?status=${status}&message=${encodeURIComponent(message)}`);
    }
  }

  // GitHub OAuth
  @Get('github')
  @UseGuards(AlreadyAuthenticatedGuard)
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @UseGuards(RedisPrismaGuard)
  async githubAuthCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      if (!req.user) {
        res.redirect(
          `${this.FRONTEND_URL}/?status=400&message=${encodeURIComponent('No user found in request')}`,
        );
        return;
      }
      const userFromStrategy = req.user;
      const context = {
        ipAddress: this.extractClientIp(req),
        userAgent: this.extractUserAgent(req),
      };
      const result = await this.authService.login({
        ...(userFromStrategy as AuthDto),
        ...context,
      });
      if (
        result &&
        'accessToken' in result &&
        'refreshToken' in result &&
        'user' in result &&
        'userToken' in result
      ) {
        await this.jwt.setAuthCookies(res, result.accessToken, result.refreshToken);
        res.redirect(
          `${this.FRONTEND_URL}/?status=${result.status}&message=${encodeURIComponent(result.message)}&user=${encodeURIComponent(result.userToken)}`,
        );
      }
      res.redirect(
        `${this.FRONTEND_URL}/?status=${result?.status}&message=${encodeURIComponent(result?.message || 'Login failed')}`,
      );
    } catch (error: unknown) {
      let status = 400;
      let message = 'GitHub authentication failed';
      if (typeof error === 'object' && error !== null) {
        const errObj = error as { status?: number; message?: string };
        if (typeof errObj.status === 'number') status = errObj.status;
        if (typeof errObj.message === 'string') message = errObj.message;
      }
      res.redirect(`${this.FRONTEND_URL}/?status=${status}&message=${encodeURIComponent(message)}`);
    }
  }

  //forgetpassword ( get email)
  @Post('forgotpassword')
  async forgotPassword(@Body('email') email: string) {
    try {
      return this.authService.forgotPassword(email);
    } catch (error: unknown) {
      let status = 400;
      let message = 'Forgot password failed';
      if (typeof error === 'object' && error !== null) {
        const errObj = error as { status?: number; message?: string };
        if (typeof errObj.status === 'number') status = errObj.status;
        if (typeof errObj.message === 'string') message = errObj.message;
      }
      return { status, message };
    }
  }

  //forgetpassword ( verify otp )
  @UseGuards(RedisOnlyGuard)
  @Post('verifyotp')
  async verifyOtp(
    @Body() body: { email: string; otp: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const result = await this.authService.verifyOtp(body.email, body.otp);
      await this.jwt.setResetPasswordCookie(res, result.resetToken);
      return {
        status: result.status,
        message: result.message,
      };
    } catch (error) {
      let status = 400;
      let message = 'OTP verification failed';
      if (typeof error === 'object' && error !== null) {
        const errObj = error as { status?: number; message?: string };
        if (typeof errObj.status === 'number') status = errObj.status;
        if (typeof errObj.message === 'string') message = errObj.message;
      }
      return { status, message };
    }
  }

  //forgetpassword ( reset password )
  @UseGuards(RedisPrismaGuard)
  @Post('resetpassword')
  async resetPassword(@Body() body: { password: string }, @Req() req: Request) {
    try {
      const resetToken = typeof req.cookies?.resetToken === 'string' ? req.cookies.resetToken : '';
      return await this.authService.resetPassword(resetToken, body.password);
    } catch (error: unknown) {
      let status = 400;
      let message = 'Reset password failed';
      if (typeof error === 'object' && error !== null) {
        const errObj = error as { status?: number; message?: string };
        if (typeof errObj.status === 'number') status = errObj.status;
        if (typeof errObj.message === 'string') message = errObj.message;
      }
      return { status, message };
    }
  }
  //Logot single session
  @UseGuards(RedisPrismaGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const refreshToken =
        typeof req.cookies?.refreshToken === 'string' ? req.cookies.refreshToken : '';
      const result = await this.authService.logout(refreshToken);
      if (result && typeof result.status === 'number' && result.status === 200) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
      }
      return result;
    } catch (error) {
      let status = 400;
      let message = 'Logout failed';
      if (typeof error === 'object' && error !== null) {
        const errObj = error as { status?: number; message?: string };
        if (typeof errObj.status === 'number') status = errObj.status;
        if (typeof errObj.message === 'string') message = errObj.message;
      }
      return { status, message };
    }
  }

  // Logout all sessions

  @UseGuards(RedisPrismaGuard)
  @Post('logoutall')
  async logoutAll(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const refreshToken =
        typeof req.cookies?.refreshToken === 'string' ? req.cookies.refreshToken : '';
      const result = await this.authService.logoutAll(refreshToken);
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return result;
    } catch (error) {
      let status = 400;
      let message = 'Logout all failed';
      if (typeof error === 'object' && error !== null) {
        const errObj = error as { status?: number; message?: string };
        if (typeof errObj.status === 'number') status = errObj.status;
        if (typeof errObj.message === 'string') message = errObj.message;
      }
      return { status, message };
    }
  }
  @UseGuards(RedisPrismaGuard)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ status: number; message: string; user?: any } | void> {
    try {
      const refreshToken =
        typeof req.cookies?.refreshToken === 'string' ? req.cookies.refreshToken : '';
      const result = await this.authService.refreshTokens(refreshToken);
      if (result && 'accessToken' in result && 'refreshToken' in result) {
        await this.jwt.setAuthCookies(res, result.accessToken, result.refreshToken);
        return {
          status: result.status,
          message: result.message,
        };
      }
    } catch (error) {
      let status = 401;
      let message = 'Unauthorized';
      if (typeof error === 'object' && error !== null) {
        const errObj = error as { status?: number; message?: string };
        if (typeof errObj.status === 'number') status = errObj.status;
        if (typeof errObj.message === 'string') message = errObj.message;
      }
      return { status, message };
    }
  }

  private extractClientIp(req: Request): string | undefined {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0]?.trim() || undefined;
    }
    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return forwarded[0]?.split(',')[0]?.trim() || undefined;
    }
    return req.ip || undefined;
  }

  private extractUserAgent(req: Request): string | undefined {
    const ua = req.headers['user-agent'];
    if (Array.isArray(ua)) {
      return ua[0] || undefined;
    }
    return typeof ua === 'object' ? ua : undefined;
  }
  // Email verification endpoint
  @Get('verifyemail')
  async verifyEmail(@Query('token') token: string) {
    try {
      // console.log('Verifying email with token:', token);
      const result = await this.authService.verifyEmail(token);
      if (result && typeof result === 'object' && 'status' in result && 'message' in result) {
        return {
          status: (result as { status: number }).status,
          message: (result as { message: string }).message,
        };
      }
      return { status: 400, message: 'Email verification failed' };
    } catch (error) {
      const err = error as { status?: number; name?: string; message?: string };
      return { status: err.status || 400, message: err.message || 'Email verification failed' };
    }
  }
}

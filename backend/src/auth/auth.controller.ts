import { Body, Controller, Post, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './auth.dto';
import { JwtService } from '../jwt/jwt.service';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RedisOnlyGuard, RedisPrismaGuard } from 'src/common/health-check.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwt: JwtService,
  ) {}

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
      const err = error as { status?: number; name?: string; message?: string };
      response
        .status(err.status || 400)
        .json({ type: err.name || 'Error', message: err.message || 'Login failed' });
    }
  }

  // Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @UseGuards(RedisPrismaGuard)
  async googleAuthCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const userFromStrategy = req.user;
      const context = {
        ipAddress: this.extractClientIp(req),
        userAgent: this.extractUserAgent(req),
      };
      const result = await this.authService.login({
        ...(userFromStrategy as AuthDto),
        ...context,
      });
      if (result && 'accessToken' in result && 'refreshToken' in result) {
        await this.jwt.setAuthCookies(res, result.accessToken, result.refreshToken);
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
      const err = error as { status?: number; name?: string; message?: string };
      res
        .status(err.status || 400)
        .json({
          type: err.name || 'Error',
          message: err.message || 'Google authentication failed',
        });
    }
  }

  // GitHub OAuth
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @UseGuards(RedisPrismaGuard)
  async githubAuthCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const userFromStrategy = req.user;
      const context = {
        ipAddress: this.extractClientIp(req),
        userAgent: this.extractUserAgent(req),
      };
      const result = await this.authService.login({
        ...(userFromStrategy as AuthDto),
        ...context,
      });
      if (result && 'accessToken' in result && 'refreshToken' in result) {
        await this.jwt.setAuthCookies(res, result.accessToken, result.refreshToken);
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
      const err = error as { status?: number; name?: string; message?: string };
      res
        .status(err.status || 400)
        .json({
          type: err.name || 'Error',
          message: err.message || 'GitHub authentication failed',
        });
    }
  }

  //forgetpassword ( get email)
  @Post('forgotpassword')
  async forgotPassword(@Body('email') email: string) {
    try {
      return this.authService.forgotPassword(email);
    } catch (error) {
      const err = error as { status?: number; name?: string; message?: string };
      return { status: err.status || 400, message: err.message || 'Forgot password failed' };
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
      const err = error as { status?: number; name?: string; message?: string };
      res
        .status(err.status || 400)
        .json({ type: err.name || 'Error', message: err.message || 'OTP verification failed' });
    }
  }

  //forgetpassword ( reset password )
  @UseGuards(RedisPrismaGuard)
  @Post('resetpassword')
  async resetPassword(@Body() body: { password: string }, @Req() req: Request) {
    try {
      const resetToken = req.cookies?.resetToken; //get the reset token from http only cookie
      return this.authService.resetPassword(resetToken, body.password);
    } catch (error) {
      const err = error as { status?: number; name?: string; message?: string };
      return { status: err.status || 400, message: err.message || 'Reset password failed' };
    }
  }
  //Logot single session

  @UseGuards(RedisPrismaGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const result = await this.authService.logout(refreshToken);
      if (result.status === 200) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
      }
      return result;
    } catch (error) {
      const err = error as { status?: number; name?: string; message?: string };
      res
        .status(err.status || 400)
        .json({ type: err.name || 'Error', message: err.message || 'Logout failed' });
    }
  }

  // Logout all sessions

  @UseGuards(RedisPrismaGuard)
  @Post('logoutall')
  async logoutAll(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const result = await this.authService.logoutAll(refreshToken);
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return result;
    } catch (error) {
      const err = error as { status?: number; name?: string; message?: string };
      res
        .status(err.status || 400)
        .json({ type: err.name || 'Error', message: err.message || 'Logout all failed' });
    }
  }
  @UseGuards(RedisPrismaGuard)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ status: number; message: string; user?: any } | void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const result = await this.authService.refreshTokens(refreshToken);
      if (result && 'accessToken' in result && 'refreshToken' in result) {
        await this.jwt.setAuthCookies(res, result.accessToken, result.refreshToken);
        return {
          status: result.status,
          message: result.message,
        };
      }
    } catch (error) {
      const err = error as { status?: number; name?: string; message?: string };
      res
        .status(err.status || 401)
        .json({ type: err.name || 'Error', message: err.message || 'Unauthorized' });
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
    return ua || undefined;
  }
}

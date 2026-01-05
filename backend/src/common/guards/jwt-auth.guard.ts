import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthRequestUser } from '@workspace/shared-types';
import { Request, Response } from 'express';

@Injectable()
export class ProcteGuard implements CanActivate {
  private FRONTEND_URL: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.FRONTEND_URL = this.configService.get<string>('FRONTEND_URL') || '';
    if (!this.FRONTEND_URL) {
      throw new Error('FRONTEND_URL is not defined in environment variables');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken =
      typeof request.headers['accesstoken'] === 'string'
        ? request.headers['accesstoken']
        : typeof request.cookies?.accessToken === 'string'
          ? request.cookies.accessToken
          : '';
    const refreshToken =
      typeof request.headers['refreshtoken'] === 'string'
        ? request.headers['refreshtoken']
        : typeof request.cookies?.refreshToken === 'string'
          ? request.cookies.refreshToken
          : '';

    if (!accessToken || !refreshToken) {
      throw new BadRequestException('Access token and refresh token are required');
    }

    try {
      const user: AuthRequestUser = await this.jwtService.verifyAsync(accessToken);
      if (!user || typeof user !== 'object') {
        throw new BadRequestException('Invalid access token payload');
      }
      request.user = user;
      return true;
    } catch {
      throw new BadRequestException('Invalid or expired access token');
    }
  }
}
export class AlreadyAuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    // If user is already authenticated, block access and redirect
    if (req?.user) {
      console.log('User is already authenticated:', req.user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/?status=403&message=${encodeURIComponent('You are already logged in. Cannot access this page')}`;
      res.redirect(redirectUrl);
      return false;
    }
    return true;
  }
}

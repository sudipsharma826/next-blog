import { BadRequestException, Injectable } from '@nestjs/common';
import { Response, CookieOptions } from 'express';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { AuthRequestUser, JwtPayload, UserInfoPayload } from '@workspace/shared-types';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  private readonly isProduction: boolean;

  constructor(
    private readonly jwt: NestJwtService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.isProduction = this.config.get<boolean>('isProduction') as boolean;
    if(!this.isProduction){
     throw new Error('isProduction config is not set properly');
    }
  }
  generateUserToken(payload: UserInfoPayload): string {
    //console.log(`👤 User token created for ${payload.user.email}`);
    return this.jwt.sign(
      { user: payload },
      {
        expiresIn: '5m',
      },
    );
  }

  generateAccessToken(payload: JwtPayload): string {
    //console.log(`🔑 Access token created for ${payload.email}`);
    //set iat and exp for acessToken
    // payload.iat = Math.floor(Date.now() / 1000);
    // payload.exp = payload.iat + 15 * 60; // 15 minutes
    return this.jwt.sign(payload, {
      expiresIn: '15m',
    });
  }

  generateRefreshToken(payload: JwtPayload): string {
    //console.log(`🔁 Refresh token created for ${payload.email}`);
    //set iat and exp for acessToken
    // payload.iat = Math.floor(Date.now() / 1000);
    // payload.exp = payload.iat + 7 * 24 * 60 * 60; // 7 days
    return this.jwt.sign(payload, {
      expiresIn: '7d',
    });
  }

  generateEmailToken(payload: { id: string; email: string }) {
    //console.log(`📩 Email verification token created for ${payload.email}`);
    return this.jwt.sign(payload, {
      expiresIn: '5m',
    });
  }
  generateResetPasswordToken(payload: { iat: number; email: string }) {
    //console.log(`📩 Email verification token created for ${payload.email}`);
    return this.jwt.sign(payload, {
      expiresIn: '5m',
    });
  }

  // set the acess and refresh token in http only cookie
  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      sameSite: this.isProduction ? 'none' : 'lax',
      secure: this.isProduction,
      path: '/',
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    //console.log('🍪 Auth cookies set successfully');
    return;
  }

  //set the forgetPassword token in http only cookie
  setResetPasswordCookie(res: Response, resetToken: string) {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      sameSite: this.isProduction ? 'none' : 'lax',
      secure: this.isProduction,
      path: '/',
    };

    res.cookie('resetToken', resetToken, {
      ...cookieOptions,
      maxAge: 5 * 60 * 1000, // 5 minutes
    });
  }

  // Verify the token and return the decoded payload ( e.g acess token , refresh token , email verification token)
  async verifyToken(token: string) {
    try {
      const result: AuthRequestUser = await this.jwt.verifyAsync(token);
      // //console.log("Result of token verification:", result);
      return result;
    } catch {
      throw new BadRequestException('Invalid token');
    }
  }
}

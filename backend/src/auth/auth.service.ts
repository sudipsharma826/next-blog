import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './auth.dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { AuthProvider } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '../jwt/jwt.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { JwtPayload, UserDataFromDB, UserInfoPayload } from '@workspace/shared-types';

@Injectable()
export class AuthService {
  private readonly FRONTEND_URL: string;
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.FRONTEND_URL = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    if (!this.FRONTEND_URL) {
      throw new Error('FRONTEND_URL is not defined in environment variables');
    }
  }

  async login(authDto: AuthDto) {
    const { name, email, password, provider, emailVerified, image, ipAddress, userAgent } = authDto;
    console.log('Auth DTO:', authDto);
    const sessionContext = { ipAddress, userAgent };
    if (!email || !provider) {
      throw new BadRequestException('Invalid login data');
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        password: true,
        image: true,
        roles: true,
        globalTokenVersion: true,
      },
    });

    // --- User exists ---
    if (user) {
      // OAuth login (Google/GitHub)
      if (provider !== 'Credentials') {
        if (user.emailVerified && emailVerified) {
          //Check if name and email are null or already set , if empty then update it will provider name and image
          // Only push provider if not already present
          const userWithProviders = await this.prisma.user.findUnique({
            where: { email },
            select: { providers: true },
          });
          const providersSet = new Set<string>(userWithProviders?.providers);
          if ((!user.name || user.name.trim() === '') && name) {
            if (!providersSet.has(provider)) {
              user = await this.prisma.user.update({
                where: { email },
                data: { name, image, providers: { push: provider as AuthProvider } },
              });
            } else {
              user = await this.prisma.user.update({
                where: { email },
                data: { name, image },
              });
            }
          } else if ((!user.image || user.image.trim() === '') && image) {
            if (!providersSet.has(provider)) {
              user = await this.prisma.user.update({
                where: { email },
                data: { image, providers: { push: provider as AuthProvider } },
              });
            } else {
              user = await this.prisma.user.update({
                where: { email },
                data: { image },
              });
            }
          } else {
            if (!providersSet.has(provider)) {
              await this.prisma.user.update({
                where: { email },
                data: { providers: { push: provider as AuthProvider } },
              });
            }
            // else do nothing
          }
          // Already verified, generate session and tokens
          return this.createSessionAndTokens(user as UserDataFromDB, sessionContext);
        } else {
          // Not verified: send verification email, do NOT generate tokens/session
          const existingToken = await this.redisService.get(`verify:email:${user.email}`);
          if (existingToken) {
            throw new BadRequestException(
              'Verification email already sent. Please wait before requesting again.',
            );
          }
          const token = this.jwtService.generateEmailToken({ id: user.id, email: user.email });
          const tokenHash = await bcrypt.hash(token, 10);
          await this.redisService.set(`verify:email:${user.email}`, tokenHash, 300); // 5 min
          const verifyLink = `${this.FRONTEND_URL}/verifyemail?token=${token}`;
          await this.emailService.sendVerificationEmail(user.email, verifyLink);
          return {
            status: 200,
            message: 'Verification email sent. Please verify your email.',
          };
        }
      }
      // Credentials login
      if (provider === 'Credentials') {
        if (!user.password || !password || !(await bcrypt.compare(password, user.password))) {
          throw new UnauthorizedException('Invalid credentials');
        }
        if (user.emailVerified) {
          //Updated the provider if not already added
          const userWithProviders = await this.prisma.user.findUnique({
            where: { email },
            select: { providers: true },
          });
          const providersSet = new Set<string>(userWithProviders?.providers);
          if (!providersSet.has(provider)) {
            await this.prisma.user.update({
              where: { email },
              data: { providers: { push: provider as AuthProvider } },
            });
          }
          // Already verified, generate session and tokens
          return this.createSessionAndTokens(user as UserDataFromDB, sessionContext);
        } else {
          // Not verified: generate verification token, store hash in Redis, send email
          const existingToken = await this.redisService.get(`verify:email:${user.email}`);
          if (existingToken) {
            throw new BadRequestException(
              'Verification email already sent. Please wait before requesting again.',
            );
          }
          const token = this.jwtService.generateEmailToken({ id: user.id, email: user.email });
          const tokenHash = await bcrypt.hash(token, 10);
          await this.redisService.set(`verify:email:${user.email}`, tokenHash, 300); // 5 min
          const verifyLink = `${this.FRONTEND_URL}/verifyemail?token=${token}`;
          try {
            await this.emailService.sendVerificationEmail(user.email, verifyLink);
          } catch (error) {
            console.error('Error sending verification email:', error);
          }
          return { status: 200, message: 'Verification email sent. Please verify your email.' };
        }
      }
    }

    // --- User does not exist ---
    if (!user) {
      // OAuth signup
      if (provider !== 'Credentials') {
        // Only save as verified if emailVerified is true from provider
        const isVerified = emailVerified === true;
        user = await this.prisma.user.create({
          data: {
            email,
            name,
            image,
            emailVerified: isVerified,
            providers: [provider as AuthProvider],
          },
        });
        if (isVerified) {
          // Verified by provider, generate session/tokens
          return this.createSessionAndTokens(user as UserDataFromDB, sessionContext);
        } else {
          // Not verified: send verification email, do NOT generate tokens/session
          const existingToken = await this.redisService.get(`verify:email:${user.email}`);
          if (existingToken) {
            throw new BadRequestException(
              'Verification email already sent. Please wait before requesting again.',
            );
          }
          const token = this.jwtService.generateEmailToken({ id: user.id, email: user.email });
          const tokenHash = await bcrypt.hash(token, 10);
          await this.redisService.set(`verify:email:${user.email}`, tokenHash, 300);
          const verifyLink = `${this.FRONTEND_URL}/verifyemail?token=${token}`;
          await this.emailService.sendVerificationEmail(user.email, verifyLink);
          return { status: 200, message: 'Verification email sent. Please verify your email.' };
        }
      }
      // Credentials signup
      if (provider === 'Credentials') {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        user = await this.prisma.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
            emailVerified: false,
            providers: [provider as AuthProvider],
          },
        });
        const existingToken = await this.redisService.get(`verify:email:${user.email}`);
        if (existingToken) {
          throw new BadRequestException(
            'Verification email already sent. Please wait before requesting again.',
          );
        }
        const token = this.jwtService.generateEmailToken({ id: user.id, email: user.email });
        const tokenHash = await bcrypt.hash(token, 10);
        await this.redisService.set(`verify:email:${user.email}`, tokenHash, 300);
        const verifyLink = `${this.FRONTEND_URL}/verifyemail?token=${token}`;
        await this.emailService.sendVerificationEmail(user.email, verifyLink);
        return { status: 200, message: 'Verification email sent. Please verify your email.' };
      }
    }
  }

  async createSessionAndTokens(
    user: UserDataFromDB,
    context?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    // Create session
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: '',
        expiryAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: context?.ipAddress ?? null,
        deviceInfo: context?.userAgent ?? null,
      },
    });
    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      gtv: user.globalTokenVersion,
      sid: session.id,
      iat: Math.floor(Date.now() / 1000),
    };
    const accessToken = this.jwtService.generateAccessToken(payload as JwtPayload);
    const refreshToken = this.jwtService.generateRefreshToken(payload as JwtPayload);
    // Hash refresh token
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    // Create session
    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: refreshTokenHash },
    });
    // Cache GTV in Redis only if not already present
    const gtvKey = `user:${user.id}:gtv`;
    const existingGtv = await this.redisService.get(gtvKey);
    if (!existingGtv) {
      await this.redisService.set(gtvKey, String(user.globalTokenVersion));
    }
    // user info saved in token to send to frontend in the url
    const userInfo = {
      user: {
        email: user.email,
        name: user.name,
        image: user.image,
        roles: user.roles,
        emailVerified: user.emailVerified,
      },
    };
    const userToken = await this.jwtService.generateUserToken(userInfo as UserInfoPayload);
    // Set cookies in the auth controller
    return {
      status: 200,
      message: 'Login successful',
      accessToken,
      refreshToken,
      sid: session.id,
      user: {
        email: user.email,
        name: user.name,
        image: user.image,
        roles: user.roles,
        emailVerified: user.emailVerified,
      },
      userToken,
    };
  }
  //forgot password step 1
  async forgotPassword(email: string) {
    if (!email) throw new BadRequestException('Email is required');
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }
    // Rate limit: check if OTP already exists in Redis
    const existingOtp = await this.redisService.get(`fp:otp:${email}`);
    if (existingOtp) {
      throw new BadRequestException('OTP already sent. Please wait before requesting again.');
    }
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Hash OTP for storage
    const otpHash = await bcrypt.hash(otp, 10);
    await this.redisService.set(`fp:otp:${email}`, otpHash, 300); // 5 min
    await this.emailService.sendForgotPasswordEmail(email, otp);
    return { status: 200, message: 'OTP has been sent to your email address.' };
  }

  //forgot password step 2
  async verifyOtp(email: string, otp: string) {
    if (!email || !otp) throw new BadRequestException('Email and OTP are required');
    const otpHash = await this.redisService.get(`fp:otp:${email}`);
    if (!otpHash || !(await bcrypt.compare(otp, otpHash))) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    // Generate reset token (JWT, expires in 5 min)
    const token = this.jwtService.generateResetPasswordToken({
      email,
      iat: Math.floor(Date.now() / 1000),
    });
    const tokenHash = await bcrypt.hash(token, 10);
    await this.redisService.set(`fp:token:${email}`, tokenHash, 300); // 5 min
    // Remove OTP after use
    await this.redisService.set(`fp:otp:${email}`, '', 1);
    return { status: 200, token, message: 'OTP verified', resetToken: token };
  }

  //forgot password step 3
  async resetPassword(token: string, password: string) {
    if (!token || !password) throw new BadRequestException('Token and new password are required');
    const decoded = (await this.jwtService.verifyToken(token)) as { iat: number; email: string };
    const email = decoded.email;
    // check iat
    const iat = decoded.iat;
    const now = Math.floor(Date.now() / 1000);
    if (now - iat > 6 * 60) {
      //6 min for the buffer, but actual expiry is 5 min
      throw new BadRequestException('Token has expired');
    }
    if (!email) throw new BadRequestException('Invalid token payload');
    const tokenHash: string | null = await this.redisService.get(`fp:token:${email}`);
    if (!tokenHash || !(await bcrypt.compare(token, tokenHash))) {
      throw new BadRequestException('Invalid or expired token');
    }
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');
    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword, globalTokenVersion: { increment: 1 } },
    });
    // Update GTV in Redis
    await this.redisService.set(`user:${user.id}:gtv`, String((user.globalTokenVersion || 0) + 1));
    // Delete all sessions for user
    await this.prisma.session.deleteMany({ where: { userId: user.id } });
    // Remove token from Redis
    await this.redisService.set(`fp:token:${email}`, '', 1);
    return { status: 200, message: 'Password reset successful. Please log in.' };
  }

  //logout single session
  async logout(refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('Refresh token required');
    const decoded = (await this.jwtService.verifyToken(refreshToken)) as Partial<JwtPayload>;
    const sid = typeof decoded.sid === 'string' ? decoded.sid : undefined;
    const gtv = typeof decoded.gtv === 'number' ? decoded.gtv : undefined;
    console.log('SessionId:', sid, 'GTV:', gtv);
    if (!sid || gtv === undefined || gtv === null)
      throw new BadRequestException('Session ID and GTV required');
    // to logout the sid must be there in the database
    const session = await this.prisma.session.findUnique({ where: { id: sid } });
    if (!session) throw new BadRequestException('Session not found');
    const userGtv = await this.redisService.get(`user:${session.userId}:gtv`);
    if (userGtv && Number(userGtv) !== gtv)
      throw new UnauthorizedException('Token version mismatch');
    await this.prisma.session.delete({ where: { id: sid } });
    return { status: 200, message: 'Logged out successfully' };
  }

  //logout all sessions
  async logoutAll(refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('Refresh token required');
    const decoded = (await this.jwtService.verifyToken(refreshToken)) as Partial<JwtPayload>;
    const userId = typeof decoded.userId === 'string' ? decoded.userId : undefined;
    const gtv = typeof decoded.gtv === 'number' ? decoded.gtv : undefined;
    console.log('UserId:', userId, 'GTV:', gtv);
    if (!userId || gtv == null || gtv === undefined)
      throw new BadRequestException('User ID and GTV required');
    const userGtv = await this.redisService.get(`user:${userId}:gtv`);
    if (userGtv && Number(userGtv) !== gtv)
      throw new UnauthorizedException('Token version mismatch');
    // Increment GTV in DB and Redis
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { globalTokenVersion: { increment: 1 } },
    });
    await this.redisService.set(`user:${userId}:gtv`, String(user.globalTokenVersion));
    // Delete all sessions
    await this.prisma.session.deleteMany({ where: { userId } });
    return { status: 200, message: 'Logged out from all devices' };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('Refresh token required');
    const decoded = (await this.jwtService.verifyToken(refreshToken)) as Partial<JwtPayload>;
    const sid = typeof decoded.sid === 'string' ? decoded.sid : undefined;
    const gtv = typeof decoded.gtv === 'number' ? decoded.gtv : undefined;
    const userId = typeof decoded.userId === 'string' ? decoded.userId : undefined;
    console.log('Decoded refresh token:', decoded);
    if (!sid || gtv === undefined || gtv === null || !userId) {
      throw new BadRequestException('Invalid token payload');
    }
    // Check GTV in Redis
    const redisGtv = await this.redisService.get(`user:${userId}:gtv`);
    if (!redisGtv || Number(redisGtv) !== gtv) {
      throw new UnauthorizedException('Global token version mismatch');
    }
    // Validate session and user
    const session = await this.prisma.session.findUnique({ where: { id: sid, userId } });
    if (!session) {
      throw new UnauthorizedException('Session or user not found');
    }
    // Compare refresh token hash
    if (!session.refreshToken || !(await bcrypt.compare(refreshToken, session.refreshToken))) {
      throw new UnauthorizedException('Refresh token reuse detected');
    }
    // Generate new tokens
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      gtv: user.globalTokenVersion,
      sid: session.id,
      iat: Math.floor(Date.now() / 1000),
    };
    const newAccessToken = this.jwtService.generateAccessToken(payload as JwtPayload);
    const newRefreshToken = this.jwtService.generateRefreshToken(payload as JwtPayload);
    // Update session with new refresh token and last used time
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newRefreshTokenHash, updatedAt: new Date() },
    });
    console.log('Token and session refreshed successfully for user:', user.email);
    return {
      status: 200,
      message: 'Tokens refreshed',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
  // Email verification endpoint logic
  async verifyEmail(token: string) {
    if (!token) throw new BadRequestException('Verification token required');
    // Decode token (should contain user id and email)
    let decoded: Partial<JwtPayload>;
    try {
      decoded = (await this.jwtService.verifyToken(token)) as Partial<JwtPayload>;
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
    const userId = typeof decoded.userId === 'string' ? decoded.userId : undefined;
    const email = typeof decoded.email === 'string' ? decoded.email : undefined;
    if (!userId || !email) throw new BadRequestException('Invalid token payload');
    // Get token hash from Redis
    const tokenHash = await this.redisService.get(`verify:email:${email}`);
    if (!tokenHash || !(await bcrypt.compare(token, tokenHash))) {
      throw new BadRequestException('Invalid or expired token');
    }
    // Set emailVerified true in DB
    const user = await this.prisma.user.update({
      where: { id: userId, email },
      data: { emailVerified: true },
    });
    // If no user updated, throw error
    if (!user) {
      throw new BadRequestException('User not found or email mismatch');
    }
    // Remove token from Redis
    await this.redisService.set(`verify:email:${email}`, '', 1);
    return { status: 200, message: 'Email verification successful.' };
  }
}

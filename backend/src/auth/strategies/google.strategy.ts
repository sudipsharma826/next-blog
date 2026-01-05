import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile as GoogleProfile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:5000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): void {
    // console.log('Google profile:', profile);
    const { id, displayName, emails, photos } = profile;
    const user = {
      provider: 'Google',
      providerId: id,
      name: displayName,
      email: emails?.[0]?.value,
      emailVerifed: emails?.[0]?.verified,
      image: photos?.[0]?.value,
      emailVerified: profile.emails?.[0]?.verified ?? true,
    };
    done(null, user);
  }
}

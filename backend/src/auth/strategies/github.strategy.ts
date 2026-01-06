import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile as GithubProfile } from 'passport-github2';
import { VerifyCallback } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from '../auth.dto';


@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID')!,
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET')!,
      callbackURL:
        configService.get<string>('GITHUB_CALLBACK_URL') ||
        'http://localhost:5000/auth/github/callback',
      scope: ['user:email'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: GithubProfile,
    done: VerifyCallback,
  ): void {
    //console.log('GitHub profile:', profile);
    const { displayName, emails, photos, username } = profile;
    const primaryEmail = emails?.[0]?.value;
    const hasEmail = Boolean(primaryEmail);
    const user :AuthDto = {
      provider: 'Github',
      name: displayName || username,
      email: primaryEmail || '',
      image: photos?.[0]?.value,
      emailVerified: hasEmail, // github doesnot provide the verifired key and value
    };
    done(null, user);
  }
}

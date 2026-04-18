import { prisma } from './db.service';
import { configService } from './config.service';
import * as jwt from 'jsonwebtoken';

export class AuthService {
  async validateOAuthUser(profile: any, provider: string) {
    let player = await prisma.player.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId: profile.id
        }
      }
    });

    if (!player) {
      const username = `${provider}_${profile.id}`.toLowerCase();
      player = await prisma.player.create({
        data: {
          username,
          name: (profile.displayName || profile.username || username).toUpperCase(),
          provider,
          providerId: profile.id,
          reputation: 0,
          score: 0
        }
      });
    }

    const secret = await configService.get('JWT_SECRET') || 'VOID_RUNNER_OMEGA_PROTOCOL';
    const token = jwt.sign({ id: player.id, username: player.username }, secret);
    return { token, player };
  }
}

export const authService = new AuthService();

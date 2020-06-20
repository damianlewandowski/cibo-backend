import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Token } from './model/token.model';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === password) {
      const { password, ...result } = user;
      return result;
    }
  }

  async login(user: User): Promise<any> {
    const payload = { username: user.username, sub: user.id };
    return this.generateToken(payload);
  }

  generateToken(payload: Record<string, unknown>): Token {
    const jwtToken = this.jwtService.sign(payload, { expiresIn: '300s' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '1800s' });

    return {
      jwt_token: jwtToken,
      refresh_token: refreshToken,
    };
  }

  refreshToken(token: string) {
    console.log(token);
    try {
      const { username, sub } = this.jwtService.verify(token);
      return this.generateToken({ username, sub });
    } catch (e) {
      throw new UnauthorizedException(e);
    }
  }
}

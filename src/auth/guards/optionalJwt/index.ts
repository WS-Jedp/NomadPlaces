import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // Decode and attach the payload to the request
        const payload = this.jwtService.verify(token);
        request.user = payload;
      } catch (error) {
        // If the token is invalid, we don't attach anything
      }
    }

    // Let the request continue even if no token is found or invalid
    return true;
  }
}

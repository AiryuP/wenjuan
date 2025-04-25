import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    try {
      // 从请求头获取Authorization
      const authHeader = request.headers.authorization;
      
      if (!authHeader) {
        throw new UnauthorizedException('未提供授权令牌');
      }
      
      // 验证Bearer格式
      const [type, token] = authHeader.split(' ');
      if (type !== 'Bearer' || !token) {
        throw new UnauthorizedException('授权令牌格式无效');
      }
      
      // 验证JWT令牌
      try {
        const payload = this.jwtService.verify(token);
        // 将用户信息添加到请求对象
        request.user = payload;
        return true;
      } catch (error) {
        throw new UnauthorizedException('令牌无效或已过期');
      }
    } catch (error) {
      throw new UnauthorizedException(error.message || '认证失败');
    }
  }
} 
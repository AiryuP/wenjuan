import { Controller, Post, Get, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginData: { username: string; password: string; captcha: string },
    @Req() req: Request,
  ) {
    console.log('loginData:', loginData);
    console.log('req.ip:', req.ip);
    const clientIp = req.ip || '127.0.0.1';
    return this.authService.login(
      loginData.username,
      loginData.password,
      loginData.captcha,
      clientIp,
    );
  }

  @Get('captcha')
  getCaptcha(@Req() req: Request, @Res() res: Response) {
    const clientIp = req.ip || '127.0.0.1';
    const captcha = this.authService.generateCaptcha(clientIp);
    
    // 从Base64数据中提取实际内容
    const base64Data = captcha.image.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(buffer);
  }
}
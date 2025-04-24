import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

// 存储验证码的内存缓存
interface CaptchaItem {
  code: string;
  expireTime: number;
}

@Injectable()
export class AuthService {
  // 验证码缓存，key为客户端IP
  private captchaCache: Map<string, CaptchaItem> = new Map();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // 生成验证码
  generateCaptcha(clientIp: string): { image: string; code: string } {
    // 生成随机验证码
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // 创建一个简单的验证码图片（实际项目中可以使用更复杂的库）
    const width = 120;
    const height = 40;
    const canvas = this.createCaptchaCanvas(code, width, height);
    
    // 存储验证码到缓存，有效期5分钟
    this.captchaCache.set(clientIp, {
      code,
      expireTime: Date.now() + 5 * 60 * 1000,
    });
    
    return {
      image: canvas,
      code,
    };
  }

  // 创建验证码图片
  private createCaptchaCanvas(code: string, width: number, height: number): string {
    // 这里简化处理，返回一个Base64编码的SVG图片
    // 实际项目中可以使用canvas或专门的验证码库生成更复杂的图片
    const colors = ['#f44336', '#2196f3', '#4caf50', '#ff9800', '#9c27b0'];
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    
    // 添加背景
    svg += `<rect width="100%" height="100%" fill="#f0f0f0"/>`;
    
    // 添加干扰线
    for (let i = 0; i < 5; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x1 = Math.floor(Math.random() * width);
      const y1 = Math.floor(Math.random() * height);
      const x2 = Math.floor(Math.random() * width);
      const y2 = Math.floor(Math.random() * height);
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1"/>`;
    }
    
    // 添加验证码文字
    for (let i = 0; i < code.length; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const fontSize = Math.floor(Math.random() * 10) + 20;
      const x = 15 + i * 25 + Math.random() * 10 - 5;
      const y = height / 2 + 8 + Math.random() * 10 - 5;
      const rotate = Math.random() * 30 - 15;
      svg += `<text x="${x}" y="${y}" fill="${color}" font-size="${fontSize}" font-family="Arial" transform="rotate(${rotate} ${x} ${y})">${code[i]}</text>`;
    }
    
    svg += '</svg>';
    return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  }

  // 验证验证码
  validateCaptcha(clientIp: string, code: string): boolean {
    const captchaItem = this.captchaCache.get(clientIp);
    
    if (!captchaItem) {
      return false;
    }
    
    // 验证码过期
    if (Date.now() > captchaItem.expireTime) {
      this.captchaCache.delete(clientIp);
      return false;
    }
    
    // 验证码匹配（不区分大小写）
    const isValid = captchaItem.code.toLowerCase() === code.toLowerCase();
    
    // 验证后删除验证码，一次性使用
    this.captchaCache.delete(clientIp);
    
    return isValid;
  }

  // 用户登录
  async login(username: string, password: string, captcha: string, clientIp: string) {
    // 验证验证码
    const isCaptchaValid = this.validateCaptcha(clientIp, captcha);
    if (!isCaptchaValid) {
      return {
        code: 400,
        message: '验证码错误或已过期',
      };
    }
    
    // 查找用户
    const user = await this.userRepository.findOne({ where: { username } });
    
    // 用户不存在或密码错误
    if (!user || !this.validatePassword(password, user.password)) {
      return {
        code: 401,
        message: '用户名或密码错误',
      };
    }
    
    // 生成JWT令牌
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);
    
    return {
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      },
    };
  }

  // 验证密码
  private validatePassword(password: string, hashedPassword: string): boolean {
    // 实际项目中应该使用bcrypt等库进行密码哈希和验证
    // 这里简化处理，假设数据库中存储的是明文密码
    return password === hashedPassword;
  }

  // 初始化测试用户
  async initTestUser() {
    const testUser = await this.userRepository.findOne({ where: { username: 'admin' } });
    
    if (!testUser) {
      const user = new User();
      user.username = 'admin';
      user.password = 'admin123';
      await this.userRepository.save(user);
      console.log('测试用户已创建: admin/admin123');
    }
  }
}
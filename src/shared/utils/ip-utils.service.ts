import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class IpUtilsService {
  /**
   * Extract client IP address with proxy/load balancer support
   * Priority: Cloudflare > X-Real-IP > X-Forwarded-For > Socket
   */
  getClientIp(request: Request): string {
    // 1. Cloudflare header (if using Cloudflare)
    if (request.headers['cf-connecting-ip']) {
      return this.cleanIpAddress(request.headers['cf-connecting-ip'] as string);
    }

    // 2. X-Real-IP (nginx, etc.)
    if (request.headers['x-real-ip']) {
      return this.cleanIpAddress(request.headers['x-real-ip'] as string);
    }

    // 3. X-Forwarded-For (most common for proxies)
    if (request.headers['x-forwarded-for']) {
      const forwarded = request.headers['x-forwarded-for'] as string;
      // Take the first IP in the chain (client IP)
      return this.cleanIpAddress(forwarded.split(',')[0]);
    }

    // 4. Socket remote address (direct connection)
    if (request.socket?.remoteAddress) {
      return this.cleanIpAddress(request.socket.remoteAddress);
    }

    // 5. Connection remote address (fallback)
    if ((request as any).connection?.remoteAddress) {
      return this.cleanIpAddress((request as any).connection.remoteAddress);
    }

    // 6. Default fallback
    return 'unknown';
  }

  /**
   * Get detailed IP information including source
   */
  getDetailedIpInfo(request: Request) {
    const clientIp = this.getClientIp(request);
    
    return {
      ip: clientIp,
      source: this.getIpSource(request),
      userAgent: request.headers['user-agent'],
      headers: {
        'x-forwarded-for': request.headers['x-forwarded-for'],
        'x-real-ip': request.headers['x-real-ip'],
        'cf-connecting-ip': request.headers['cf-connecting-ip'],
      },
    };
  }

  /**
   * Determine which header was used to get the IP
   */
  private getIpSource(request: Request): string {
    if (request.headers['cf-connecting-ip']) return 'cloudflare';
    if (request.headers['x-real-ip']) return 'x-real-ip';
    if (request.headers['x-forwarded-for']) return 'x-forwarded-for';
    if (request.socket?.remoteAddress) return 'socket';
    return 'unknown';
  }

  /**
   * Clean IP address (remove IPv6 prefix, trim whitespace)
   */
  private cleanIpAddress(ip: string): string {
    let cleaned = ip.trim();
    
    // Remove IPv6 prefix if present (::ffff:192.168.1.1 -> 192.168.1.1)
    if (cleaned.startsWith('::ffff:')) {
      cleaned = cleaned.substring(7);
    }
    
    return cleaned;
  }

  /**
   * Check if IP is private/local
   */
  isPrivateIp(ip: string): boolean {
    if (ip === 'unknown' || ip === '127.0.0.1' || ip === 'localhost') {
      return true;
    }

    const privateRanges = [
      /^10\./,                      // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
      /^192\.168\./,                // 192.168.0.0/16
      /^127\./,                     // Loopback
    ];

    return privateRanges.some(range => range.test(ip));
  }

  /**
   * Validate IP address format
   */
  isValidIp(ip: string): boolean {
    if (!ip || ip === 'unknown') return false;

    // IPv4 validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(ip)) {
      const parts = ip.split('.');
      return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
    }

    // IPv6 validation (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
    return ipv6Regex.test(ip);
  }
}

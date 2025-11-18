import { Controller, All, Req, Res } from '@nestjs/common'
import { Request as ExpressRequest, Response } from 'express'
import { auth } from './auth'

@Controller({ path: 'api', version: '1' })
export class BetterAuthController {
  @All('auth/*')
  async handle(@Req() req: ExpressRequest, @Res() res: Response) {
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    const headers = new Headers()
    Object.entries(req.headers).forEach(([key, value]) => {
      if (Array.isArray(value)) headers.set(key, value.join(','))
      else if (typeof value === 'string') headers.set(key, value)
    })
    const webReq: any = new (global as any).Request(url, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : (req as any),
    })
    const result = await auth.handler(webReq)
    const outHeaders = Object.fromEntries(result.headers.entries())
    const text = await result.text()
    res.status(result.status).set(outHeaders).send(text)
  }
}
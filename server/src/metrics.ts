import { Router, Request, Response } from 'express'
import client from 'prom-client'

export const register = new client.Registry()
client.collectDefaultMetrics({ register })

export const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000]
})
register.registerMetric(httpRequestDurationSeconds)

export const metricsRouter = Router()
metricsRouter.get('/', async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType)
    res.send(await register.metrics())
  } catch (e: any) {
    console.log(`[ERROR]\napi: /metrics\nerror: ${e}\n`)
    res.status(500).end(e)
  }
})


import { Injectable, Scope } from '@nestjs/common';
import { IHandyRedis, createHandyClient } from 'handy-redis';

@Injectable({ scope: Scope.DEFAULT })
export class Redis {
  public client: IHandyRedis;

  constructor() {
    this.client = createHandyClient({
      db: process.env.APP_REDIS_DB,
    });
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UseGuards,
  applyDecorators,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Redis } from './redis';
import { TooManyRequests } from 'lib/errors';

@Injectable()
export class LimitGuard implements CanActivate {
  constructor(private reflector: Reflector, private redis: Redis) {}

  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);

    let limit = this.getLimit(context.getClass());
    const handlerLimit = this.getLimit(context.getHandler());
    if (handlerLimit) limit = handlerLimit;

    const info = ctx.getInfo();
    const method = info.fieldName as string;
    const parentType = info.parentType.toString().toLowerCase();
    const sign = ctx.getContext<Ctx>().sign;

    if (!sign) return false;

    const key = `${parentType}.${method}:${sign}`;

    const requests = await this.redis.client.incr(key);

    if (requests > limit.limit) throw new TooManyRequests();

    this.redis.client.expire(key, limit.expiration).catch(console.error);

    return true;
  }

  private getLimit(target: any) {
    return this.reflector.get<{ limit: number; expiration: number }>(
      'limit',
      target,
    );
  }
}

export const Limit = (limit: number, expiration = 1) =>
  applyDecorators(
    SetMetadata('limit', { limit, expiration }),
    UseGuards(LimitGuard),
  );

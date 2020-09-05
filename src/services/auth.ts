import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  UseGuards,
  applyDecorators,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { FastifyRequest } from 'fastify';
import qs from 'querystring';
import crypto from 'crypto';

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context).getContext<Ctx>();
    return Boolean(ctx?.userId);
  }
}

export const AuthGuard = () => applyDecorators(UseGuards(UserGuard));

export const UserId = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context).getContext<Ctx>();
    return ctx.userId;
  },
);

export const auth = async (
  secret: string,
  req: FastifyRequest,
): Promise<Ctx> => {
  const urlParams: any = req.headers.auth
    ? qs.parse(req.headers.auth as string)
    : req.query;
  const ordered = {};

  Object.keys(urlParams)
    .sort()
    .forEach(key => {
      if (key.slice(0, 3) === 'vk_') {
        ordered[key] = urlParams[key];
      }
    });

  const stringParams = qs.stringify(ordered);
  const paramsHash = crypto
    .createHmac('sha256', secret)
    .update(stringParams)
    .digest()
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=$/, '');

  let userId: number = null;
  let sign: string = null;

  if (paramsHash === urlParams.sign) {
    userId = parseInt(urlParams['vk_user_id']);
    sign = urlParams.sign;
  }

  return {
    userId,
    sign,
  };
};

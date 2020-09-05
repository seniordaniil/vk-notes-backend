import { GraphQLError } from 'graphql';

export class BaseError extends GraphQLError {
  constructor(message?: string) {
    super(message);
  }
}
export class AccessError extends BaseError {}
export class UnknownError extends BaseError {}
export class TooLongContent extends BaseError {}
export class TooManyRequests extends BaseError {}

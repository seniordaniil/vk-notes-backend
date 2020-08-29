import { ArgsType, InputType } from '@nestjs/graphql';
import { mix } from 'mix-with';
import { paginateArgs, byIdArgs, byIdInput } from 'models';

@ArgsType()
export class PaginateArgs extends mix().with(paginateArgs(100)) {}

@ArgsType()
export class ByIdArgs extends mix().with(byIdArgs) {}

@InputType()
export class ByIdInput extends mix().with(byIdInput) {}

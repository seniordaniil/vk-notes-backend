import { mix } from 'mix-with';
import { ObjectType, Field, Int, ArgsType, InputType } from '@nestjs/graphql';
import {
  folderFactory,
  folderRelFactory,
  byIdArgs,
  MemberAccess,
  byIdInput,
} from 'models';
import { PaginateArgs } from './common';

@ObjectType()
export class FolderDto extends mix().with(folderFactory) {
  @Field(type => Int)
  count: number;

  @Field(type => MemberAccess, { nullable: true })
  access?: MemberAccess;
}

@ObjectType()
export class FolderRelDto extends mix().with(folderRelFactory) {}

@ArgsType()
export class FolderArgs extends mix().with(byIdArgs) {
  @Field({ nullable: true })
  invite?: string;
}

@ArgsType()
export class FolderRelArgs extends mix(PaginateArgs).with(byIdArgs) {}

@InputType()
export class CreateFolderInput {
  @Field()
  name: string;
}

@InputType()
export class UpdateFolderInput extends mix(CreateFolderInput).with(byIdInput) {}

@InputType()
export class FolderMemberInput extends mix().with(byIdInput) {
  @Field(type => Int)
  memberId: number;
}

@InputType()
export class JoinFolderInput extends mix().with(byIdInput) {
  @Field()
  invite: string;
}

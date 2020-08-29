import { mix } from 'mix-with';
import { ObjectType, Field, InputType, ArgsType } from '@nestjs/graphql';
import { noteFactory } from 'models';
import { ByIdInput, PaginateArgs } from './common';

@ObjectType()
export class NoteDto extends mix().with(noteFactory) {}

@InputType()
export class ByNoteInput extends ByIdInput {
  @Field()
  folderId: string;
}

@InputType()
export class CreateNoteInput extends ByIdInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  text?: string;
}

@InputType()
export class UpdateNoteInput extends CreateNoteInput {
  @Field()
  noteId: string;
}

@ArgsType()
export class GetNotesArgs extends PaginateArgs {
  @Field({ nullable: true })
  folderId?: string;
}

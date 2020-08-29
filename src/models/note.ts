import { mix, Constructor } from 'mix-with';
import { Column } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { withUserId, withPK, withUpdated } from './common';

export const noteFactory = (superclass: Constructor) => {
  @ObjectType({ isAbstract: true })
  class Note extends mix(superclass).with(
    withPK,
    withUserId(false),
    withUpdated,
  ) {
    @Column({ default: '' })
    @Field()
    title: string;

    @Column({ nullable: true })
    @Field({ nullable: true })
    text?: string;

    @Field()
    folderId: string;
  }

  return Note;
};

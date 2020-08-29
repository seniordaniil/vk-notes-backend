import { Constructor, mix } from 'mix-with';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { withPK, withDate, withUserId } from './common';
import { Column } from 'typeorm';

export const folderFactory = (superclass: Constructor) => {
  @ObjectType({ isAbstract: true })
  class Folder extends mix(superclass).with(withPK, withDate) {
    @Field()
    @Column()
    name: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    invite?: string;
  }

  return Folder;
};

export enum MemberAccess {
  Member,
  Admin,
}

registerEnumType(MemberAccess, { name: 'MemberAccess' });

export const folderRelFactory = (superclass: Constructor) => {
  @ObjectType({ isAbstract: true })
  class FolderRel extends mix(superclass).with(withDate, withUserId(true)) {
    @Column({
      type: 'enum',
      enum: MemberAccess,
      default: MemberAccess.Member,
    })
    @Field(type => MemberAccess)
    access: MemberAccess;

    @Field()
    folderId: string;
  }

  return FolderRel;
};

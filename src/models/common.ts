import { Constructor, mix } from 'mix-with';
import {
  ID,
  Field,
  ObjectType,
  ArgsType,
  Int,
  InputType,
} from '@nestjs/graphql';
import { IsUUID, Max, Min } from 'class-validator';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

export const withId = (superclass: Constructor) => {
  @ObjectType({ isAbstract: true })
  class WithId extends superclass {
    @Field(type => ID)
    @IsUUID()
    id: string;
  }

  return WithId;
};

export const withPK = (superclass: Constructor) => {
  @ObjectType({ isAbstract: true })
  class WithPK extends mix(superclass).with(withId) {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  }

  return WithPK;
};

export const withUserId = (primary = false) => (superclass: Constructor) => {
  @ObjectType({ isAbstract: true })
  class WithUserId extends superclass {
    @Column({ primary })
    @Field(type => Int)
    userId: number;
  }

  return WithUserId;
};

export const withDate = (superclass: Constructor) => {
  @ObjectType({ isAbstract: true })
  class WithDate extends superclass {
    @CreateDateColumn({ type: 'timestamptz', precision: 3 })
    @Field()
    date: Date;
  }

  return WithDate;
};

export const withUpdated = (superclass: Constructor) => {
  @ObjectType({ isAbstract: true })
  class WithUpdated extends superclass {
    @UpdateDateColumn({ type: 'timestamptz', precision: 3 })
    @Field()
    updated: Date;
  }

  return WithUpdated;
};

export const limitArgs = (max: number) => (superclass: Constructor) => {
  @ArgsType()
  class Limit extends superclass {
    @Field(type => Int)
    @Max(max)
    @Min(1)
    limit: number;
  }

  return Limit;
};

export const paginateArgs = (max: number) => (superclass: Constructor) => {
  @ArgsType()
  class Paginate extends mix(superclass).with(limitArgs(max)) {
    @Field(type => Int)
    offset: number;
  }

  return Paginate;
};

export const byIdArgs = (superclass: Constructor) => {
  @ArgsType()
  class ById extends superclass {
    @Field()
    @IsUUID()
    id: string;
  }

  return ById;
};

export const byIdInput = (superclass: Constructor) => {
  @InputType()
  class ById extends superclass {
    @Field()
    @IsUUID()
    id: string;
  }

  return ById;
};

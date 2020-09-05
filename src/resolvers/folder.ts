import {
  Args,
  Int,
  Mutation,
  Query,
  Resolver,
  Directive,
} from '@nestjs/graphql';
import {
  ByIdArgs,
  CreateFolderInput,
  FolderArgs,
  FolderDto,
  FolderRelArgs,
  FolderRelDto,
  PaginateArgs,
  UpdateFolderInput,
  FolderMemberInput,
  ByIdInput,
  JoinFolderInput,
} from 'dto';
import { MemberAccess } from 'models';
import { AuthGuard, UserId, VKService, Limit } from 'services';
import { getManager, getRepository, Not } from 'typeorm';
import { FolderEntity, FolderRelEntity, NoteEntity } from 'entities';
import { AccessError, UnknownError } from 'lib/errors';
import crypto from 'crypto';

@AuthGuard()
@Limit(5)
@Resolver()
export class FolderResolver {
  constructor(private vkService: VKService) {}

  @Query(returns => [FolderDto])
  folders(@UserId() userId: number, @Args() { offset, limit }: PaginateArgs) {
    return this.folderByUserQuery(userId)
      .orderBy('"folder"."name"', 'ASC')
      .addOrderBy(`"folder"."id"`, 'ASC')
      .limit(limit)
      .offset(offset)
      .getRawMany();
  }

  @Query(returns => Int)
  async foldersCount(@UserId() userId: number) {
    const res = await getRepository(FolderRelEntity)
      .createQueryBuilder('rel')
      .select('COUNT(*)::int', 'count')
      .where(`"rel"."userId" = :userId`, { userId })
      .getRawOne();
    return res.count;
  }

  @Query(returns => FolderDto, { nullable: true })
  folder(@UserId() userId: number, @Args() { id, invite }: FolderArgs) {
    if (invite) {
      return this.folderQuery()
        .addSelect(qb => {
          return qb
            .select(`"rel"."access"::varchar::int`, 'access')
            .from(FolderRelEntity, 'rel')
            .where(`"rel"."userId" = :userId`, { userId })
            .andWhere(`"rel"."folderId" = "folder"."id"`);
        }, 'access')
        .where(`"folder"."invite" = :invite`, { invite })
        .andWhere(`"folder"."id" = :id`, { id })
        .getRawOne();
    } else {
      return this.folderByUserQuery(userId)
        .andWhere(`"folder"."id" = :id`, { id })
        .getRawOne();
    }
  }

  private folderQuery() {
    return getRepository(FolderEntity)
      .createQueryBuilder('folder')
      .select(`"folder"."id"`, 'id')
      .addSelect(`"folder"."name"`, 'name')
      .addSelect(`"folder"."date"`, 'date')
      .addSelect(`"folder"."invite"`, 'invite')
      .addSelect(qb => {
        return qb
          .select(`COUNT(*)::int`)
          .from(NoteEntity, 'note')
          .where(`"note"."folderId" = "folder"."id"`);
      }, 'count');
  }

  private folderByUserQuery(userId: number) {
    return this.folderQuery()
      .addSelect(`"rel"."access"::varchar::int`, 'access')
      .leftJoin(FolderRelEntity, 'rel', `"folder"."id" = "rel"."folderId"`)
      .where(`"rel"."userId" = :userId`, { userId });
  }

  @Query(returns => [FolderRelDto])
  async members(
    @UserId() userId: number,
    @Args() { id, limit, offset }: FolderRelArgs,
  ): Promise<FolderRelDto[]> {
    const members = await getRepository(FolderRelEntity).find({
      where: {
        folder: {
          id,
        },
      },
      take: limit,
      skip: offset,
      order: {
        date: 'DESC',
        userId: 'ASC',
      },
    });

    if (offset === 0 && members.length === 1 && members[0].userId === userId)
      return [members[0]];
    if (members.length < 1) return [];

    const response = await this.vkService.vk.api.users.get({
      user_ids: members.map(member => member.userId).join(','),
      fields: ['photo_50'],
    });

    return members.map((member, index) => {
      const m: FolderRelDto = member;

      m.photo = response[index].photo_50;
      m.fullName = `${response[index].first_name} ${response[index].last_name}`;

      return m;
    });
  }

  @Query(returns => Int)
  async membersCount(@Args() { id }: ByIdArgs) {
    const data = await getRepository(FolderRelEntity)
      .createQueryBuilder('rel')
      .select(`COUNT(*)::int`, 'count')
      .where(`"rel"."folderId" = :folderId`, { folderId: id })
      .getRawOne();
    return data.count;
  }

  @Mutation(returns => FolderDto, {})
  createFolder(
    @UserId() userId: number,
    @Args('input') { name }: CreateFolderInput,
  ) {
    return getManager().transaction(async tx => {
      const fRep = tx.getRepository(FolderEntity);
      const folder = await fRep.save(
        fRep.create({
          name,
        }),
      );

      const access = MemberAccess.Admin;

      const frRep = tx.getRepository(FolderRelEntity);
      await frRep.save(
        frRep.create({
          folder,
          userId,
          access,
        }),
      );

      return {
        ...folder,
        access,
        count: 0,
      };
    });
  }

  @Mutation(returns => Boolean)
  updateFolder(
    @UserId() userId: number,
    @Args('input') { name, id }: UpdateFolderInput,
  ) {
    return getManager().transaction(async tx => {
      const rel = await tx.getRepository(FolderRelEntity).findOne({
        folder: {
          id,
        },
        userId,
      });

      if (!rel || rel.access !== MemberAccess.Admin) throw new AccessError();

      const res = await tx.getRepository(FolderEntity).update({ id }, { name });

      return res.affected === 1;
    });
  }

  @Mutation(returns => String)
  createInvite(@UserId() userId: number, @Args('input') { id }: ByIdInput) {
    return getManager().transaction(async tx => {
      const rel = await tx.getRepository(FolderRelEntity).findOne({
        folder: {
          id,
        },
        userId,
      });

      if (!rel || rel.access !== MemberAccess.Admin) throw new AccessError();

      const invite = crypto.randomBytes(16).toString('hex');

      const res = await tx
        .getRepository(FolderEntity)
        .update({ id }, { invite });

      if (res.affected !== 1) throw new UnknownError();

      return invite;
    });
  }

  @Mutation(returns => Boolean)
  deleteInvite(@UserId() userId: number, @Args('input') { id }: ByIdInput) {
    return getManager().transaction(async tx => {
      const rel = await tx.getRepository(FolderRelEntity).findOne({
        folder: {
          id,
        },
        userId,
      });

      if (!rel || rel.access !== MemberAccess.Admin) throw new AccessError();

      const res = await tx
        .getRepository(FolderEntity)
        .update({ id }, { invite: null });

      return res.affected === 1;
    });
  }

  @Mutation(returns => Boolean)
  removeMember(
    @UserId() userId: number,
    @Args('input') { id, memberId }: FolderMemberInput,
  ) {
    return getManager().transaction(async tx => {
      const rel = await tx.getRepository(FolderRelEntity).findOne({
        folder: {
          id,
        },
        userId,
      });

      if (!rel || rel.access !== MemberAccess.Admin) throw new AccessError();

      const res = await tx.getRepository(FolderRelEntity).delete({
        folder: {
          id,
        },
        userId: memberId,
        access: Not(MemberAccess.Admin),
      });

      return res.affected === 1;
    });
  }

  @Mutation(returns => Boolean)
  async leaveFolder(
    @UserId() userId: number,
    @Args('input') { id }: ByIdInput,
  ) {
    const res = await getRepository(FolderRelEntity).delete({
      folder: {
        id,
      },
      userId,
    });

    return res.affected === 1;
  }

  @Mutation(returns => Boolean)
  removeFolder(@UserId() userId: number, @Args('input') { id }: ByIdInput) {
    return getManager().transaction(async tx => {
      const rel = await tx.getRepository(FolderRelEntity).findOne({
        folder: {
          id,
        },
      });

      if (!rel || rel.access !== MemberAccess.Admin) throw new AccessError();

      const res = await tx.getRepository(FolderEntity).delete({
        id,
      });

      return res.affected === 1;
    });
  }

  @Mutation(returns => FolderRelDto)
  async joinFolder(
    @UserId() userId: number,
    @Args('input') { id, invite }: JoinFolderInput,
  ) {
    const folder = await getRepository(FolderEntity).findOne({
      id,
      invite,
    });

    if (!folder) throw new AccessError();

    const rep = getRepository(FolderRelEntity);
    const rel = rep.create({
      userId,
      folder,
    });

    return rep.save(rel);
  }
}

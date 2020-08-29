import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import {
  NoteDto,
  ByIdArgs,
  CreateNoteInput,
  UpdateNoteInput,
  ByNoteInput,
  GetNotesArgs,
} from 'dto';
import { AuthGuard, UserId } from 'services';
import { getRepository, getManager } from 'typeorm';
import { FolderRelEntity, NoteEntity } from 'entities';
import { AccessError, UnknownError } from 'lib/errors';

@AuthGuard()
@Resolver()
export class NoteResolver {
  @Query(returns => [NoteDto])
  notes(
    @UserId() userId: number,
    @Args() { offset, limit, folderId }: GetNotesArgs,
  ) {
    return this.noteQuery(userId)
      .where(`"rel"."userId" = :userId`, { userId })
      .andWhere(`(:skip OR "note"."folderId" = :folderId)`, {
        folderId,
        skip: !folderId,
      })
      .orderBy(`"note"."updated"`, 'DESC')
      .addOrderBy(`"note"."id"`, 'ASC')
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  @Query(returns => NoteDto, { nullable: true })
  note(@UserId() userId: number, @Args() { id }: ByIdArgs) {
    return this.noteQuery(userId)
      .andWhere(`"note"."id" = :id`, { id })
      .getOne();
  }

  private noteQuery(userId: number) {
    return getRepository(NoteEntity)
      .createQueryBuilder('note')
      .leftJoin(FolderRelEntity, 'rel', `"note"."folderId" = "rel"."folderId"`)
      .where(`"rel"."userId" = :userId`, { userId });
  }

  @Mutation(returns => NoteDto)
  createNote(
    @UserId() userId: number,
    @Args('input') { id, title, text }: CreateNoteInput,
  ) {
    return getManager().transaction(async tx => {
      const rel = await tx.getRepository(FolderRelEntity).findOne({
        folder: {
          id,
        },
        userId,
      });

      if (!rel) throw new AccessError();

      const nRep = tx.getRepository(NoteEntity);

      return nRep.save(
        nRep.create({
          title,
          text,
          folder: {
            id,
          },
          userId,
        }),
      );
    });
  }

  @Mutation(returns => Date)
  updateNote(
    @UserId() userId: number,
    @Args('input') { id, title, text, noteId }: UpdateNoteInput,
  ) {
    return getManager().transaction(async tx => {
      const rel = await tx.getRepository(FolderRelEntity).findOne({
        folder: {
          id,
        },
        userId,
      });

      if (!rel) throw new AccessError();

      const nRep = tx.getRepository(NoteEntity);
      const updated = new Date();

      const res = await nRep.update(
        {
          id: noteId,
          folder: {
            id,
          },
        },
        {
          title,
          text,
          userId,
          updated
        },
      );

      if (res.affected !== 1) throw new UnknownError();

      return updated;
    });
  }

  @Mutation(returns => Boolean)
  removeNote(
    @UserId() userId: number,
    @Args('input') { id, folderId }: ByNoteInput,
  ) {
    return getManager().transaction(async tx => {
      const rel = await tx.getRepository(FolderRelEntity).findOne({
        folder: {
          id: folderId,
        },
        userId,
      });

      if (!rel) throw new AccessError();

      const res = await tx
        .getRepository(NoteEntity)
        .delete({ id, folder: { id: folderId } });

      return res.affected === 1;
    });
  }
}

import {
  createConnection,
  getConnectionOptions,
  getManager,
  getRepository,
  In,
} from 'typeorm';
import path from 'path';
import { FolderEntity, NoteEntity, FolderRelEntity } from 'entities';

describe('queries', () => {
  beforeAll(async () => {
    const options = await getConnectionOptions();
    await createConnection({
      ...options,
      entities: [
        path.join(__dirname, '../entities/*.ts'),
        path.join(__dirname, '../entities/**/*.ts'),
      ],
    });
  });

  test('create', async () => {
    const fRep = getRepository(FolderEntity);

    const f1 = await fRep.save(
      fRep.create({
        name: 'f1',
      }),
    );

    const frRep = getRepository(FolderRelEntity);

    const fr1 = await frRep.save(
      frRep.create({
        userId: 1,
        folder: {
          id: f1.id,
        },
      }),
    );

    const nRep = getRepository(NoteEntity);

    await nRep.save(
      nRep.create({
        userId: 1,
        folder: f1,
      }),
    );
  });

  test('createNotes', async () => {
    const nRep = getRepository(NoteEntity);

    await nRep.save(
      Array<DeepPartial<NoteEntity>>(100).fill({
        userId: 292557884,
        title: 'Test',
        folder: {
          id: 'ccd0097a-b842-434d-8c9f-016effc10791',
        },
      }),
    );
  });

  test('findNotes', async () => {
    const nRep = getRepository(NoteEntity);

    const data = await nRep
      .createQueryBuilder('note')
      .leftJoin(FolderRelEntity, 'rel', `"note"."folderId" = "rel"."folderId"`)
      .where(`"rel"."userId" = :userId`, { userId: 1 })
      .orderBy(`"note"."updated"`, 'DESC')
      .orderBy(`"note"."id"`, 'ASC')
      .getMany();

    console.log(data);
  });

  test('findFolders', async () => {
    const fRep = getRepository(FolderEntity);

    const data = await fRep
      .createQueryBuilder('folder')
      .select(`"folder"."id"`, 'id')
      .addSelect(`"folder"."name"`, 'name')
      .addSelect(`"folder"."date"`, 'date')
      .addSelect(`"rel"."isAdmin"`, 'isAdmin')
      .addSelect(qb => {
        return qb
          .select(`COUNT(*)::int`)
          .from(NoteEntity, 'note')
          .where(`"note"."folderId" = "folder"."id"`);
      }, 'count')
      .leftJoin(FolderRelEntity, 'rel', `"folder"."id" = "rel"."folderId"`)
      .where(`"rel"."userId" = :userId`, { userId: 1 })
      .orderBy('"folder"."name"', 'ASC')
      .addOrderBy(`"folder"."id"`, 'ASC')
      .getRawMany();

    console.log(data);
  });
});

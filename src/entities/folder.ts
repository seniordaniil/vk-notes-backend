import { mix } from 'mix-with';
import { Entity, ManyToOne, RelationId } from 'typeorm';
import { folderFactory, folderRelFactory } from 'models';

@Entity()
export class FolderEntity extends mix().with(folderFactory) {}

@Entity()
export class FolderRelEntity extends mix().with(folderRelFactory) {
  @ManyToOne(type => FolderEntity, { primary: true, onDelete: 'CASCADE' })
  folder: FolderEntity;

  @RelationId((rel: FolderRelEntity) => rel.folder)
  folderId: string;
}

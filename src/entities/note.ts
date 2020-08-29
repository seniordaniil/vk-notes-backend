import { mix } from 'mix-with';
import { Entity, ManyToOne, RelationId } from 'typeorm';
import { noteFactory } from 'models';
import { FolderEntity } from './folder';

@Entity()
export class NoteEntity extends mix().with(noteFactory) {
  @ManyToOne(type => FolderEntity, { onDelete: 'CASCADE' })
  folder?: FolderEntity;

  @RelationId((rel: NoteEntity) => rel.folder)
  folderId: string;
}

import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { auth } from 'services';
import { NoteResolver, FolderResolver } from 'resolvers';

@Module({
  providers: [NoteResolver, FolderResolver],
  imports: [
    GraphQLModule.forRoot({
      path: 'api',
      playground: {
        settings: {
          'schema.polling.enable': false,
        } as any,
      },
      context: async ({ request }): Promise<Ctx> =>
        auth(process.env.APP_SECRET_KEY, request),
      autoSchemaFile: true,
    }),
  ],
})
export class AppModule {}

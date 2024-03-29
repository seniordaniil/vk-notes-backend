import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { auth, ErrorsInterceptor, VKService, Redis } from 'services';
import { NoteResolver, FolderResolver, NoteDtoResolver } from 'resolvers';

@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ErrorsInterceptor },
    Redis,
    VKService,
    NoteResolver,
    NoteDtoResolver,
    FolderResolver,
  ],
  imports: [
    GraphQLModule.forRoot({
      path: 'api',
      playground: {
        settings: {
          'schema.polling.enable': false,
        } as any,
      },
      introspection: true,
      context: async ({ request }): Promise<Ctx> =>
        auth(process.env.APP_SECRET_KEY, request),
      autoSchemaFile: true,
    }),
  ],
})
export class AppModule {}

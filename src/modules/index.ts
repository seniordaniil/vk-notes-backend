import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { auth, ErrorsInterceptor, VKService } from 'services';
import { NoteResolver, FolderResolver } from 'resolvers';

@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ErrorsInterceptor },
    VKService,
    NoteResolver,
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

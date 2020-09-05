import { Logger } from '@nestjs/common';
import { GraphQLSchemaHost, Plugin } from '@nestjs/graphql';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { GraphQLError } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
  directiveEstimator,
} from 'graphql-query-complexity';

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  constructor(private gqlSchemaHost: GraphQLSchemaHost) {}

  requestDidStart(): GraphQLRequestListener {
    const { schema } = this.gqlSchemaHost;

    return {
      didResolveOperation({ request, document }) {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 0 }),
            directiveEstimator({
              // Optionally change the name of the directive here... Default value is `complexity`
              name: 'complexity',
            }),
          ],
        });

        if (complexity >= 20) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: 20`,
          );
        }

        Logger.log(`Query complexity is ${complexity}`);
      },
    };
  }
}

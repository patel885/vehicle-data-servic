import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { config } from './config';
import { initDb } from './db';
import { typeDefs, resolvers } from './graphql/schema';
import { logger } from './utils/logger';
import { IngestionService } from './ingestion/service';

async function bootstrap() {
  // 1. Initialize DB
  initDb();

  // 2. Setup Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // 3. Start standalone server directly
  const { url } = await startStandaloneServer(server, {
    listen: { port: config.PORT },
  });

  logger.info(`GraphQL Server ready at ${url}`);

  // 4. Initial Ingestion
  try {
    const ingestion = new IngestionService();
    await ingestion.ingestData(15);
  } catch (err: any) {
    logger.error({ err: err.message }, 'Initial background ingestion failed');
  }
}

bootstrap().catch((err) => {
  logger.error({ err: err.message }, 'Failed to start service');
  process.exit(1);
});
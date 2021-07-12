import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import jwt from 'jsonwebtoken';
import DataLoader from 'dataloader';
import express from 'express';
import {
  ApolloServer,
  AuthenticationError,
} from 'apollo-server-express';

import schema from './src/schema';
import resolvers from './src/resolvers';
import models, {
  connectDb
} from './src/models';
import loaders from './src/loaders';
import CONFIG from './src/config';

const secret = process.env.SECRET;

const app = express();

app.use(cors());

const getMe = async (req) => {
  const token = req.headers['access-token'];

  if (token) {
    try {
      const decoded = await jwt.verify(token, secret);
      return decoded;
    } catch (e) {
      throw new AuthenticationError(
        'Your session expired. Sign in again.',
      );
    }
  }
  return null;
};

const server = new ApolloServer({
  introspection: true,
  typeDefs: schema,
  resolvers,
  formatError: (error) => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');

    return {
      ...error,
      message,
    };
  },
  context: async ({
    req,
    connection
  }) => {
    if (connection) {
      return {
        models,
        loaders: {
          user: new DataLoader((keys) => loaders.user.batchUsers(keys, models)),
          category: new DataLoader((keys) => loaders.category.batchCategories(keys, models)),
        },
      };
    }

    if (req) {
      const me = await getMe(req);

      return {
        models,
        me,
        secret,
        loaders: {
          user: new DataLoader((keys) => loaders.user.batchUsers(keys, models)),
          category: new DataLoader((keys) => loaders.category.batchCategories(keys, models)),
        },
      };
    }
    return null;
  },
});

server.applyMiddleware({
  app,
  path: '/graphql'
});

// const httpServer = http.createServer(app);
const httpServer = http.Server(app);
server.installSubscriptionHandlers(httpServer);

// const isTest = !!process.env.TEST_DATABASE_URL;
// const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 8000;

connectDb().then(async () => {
  // reset database
  // if (isProduction) { // isTest
  //   await Promise.all([
  //     models.User.deleteMany({}),
  //     models.Message.deleteMany({}),
  //   ]);
  // }

  httpServer.listen({
    port
  }, () => {
    console.log(`Apollo Server on http://localhost:${port}/graphql`);
    console.log(`Config Link: ${CONFIG.LINK}`);
  });
});
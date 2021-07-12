"use strict";

require("dotenv/config");

var _cors = _interopRequireDefault(require("cors"));

var _http = _interopRequireDefault(require("http"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _dataloader = _interopRequireDefault(require("dataloader"));

var _express = _interopRequireDefault(require("express"));

var _apolloServerExpress = require("apollo-server-express");

var _schema = _interopRequireDefault(require("./schema"));

var _resolvers = _interopRequireDefault(require("./resolvers"));

var _models = _interopRequireWildcard(require("./models"));

var _loaders = _interopRequireDefault(require("./loaders"));

var _config2 = _interopRequireDefault(require("./config"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const secret = process.env.SECRET;
const app = (0, _express.default)();
app.use((0, _cors.default)());

const getMe = async req => {
  const token = req.headers['access-token'];

  if (token) {
    try {
      const decoded = await _jsonwebtoken.default.verify(token, secret);
      return decoded;
    } catch (e) {
      throw new _apolloServerExpress.AuthenticationError('Your session expired. Sign in again.');
    }
  }

  return null;
};

const server = new _apolloServerExpress.ApolloServer({
  introspection: true,
  typeDefs: _schema.default,
  resolvers: _resolvers.default,
  formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message.replace('SequelizeValidationError: ', '').replace('Validation error: ', '');
    return { ...error,
      message
    };
  },
  context: async ({
    req,
    connection
  }) => {
    if (connection) {
      return {
        models: _models.default,
        loaders: {
          user: new _dataloader.default(keys => _loaders.default.user.batchUsers(keys, _models.default)),
          category: new _dataloader.default(keys => _loaders.default.category.batchCategories(keys, _models.default))
        }
      };
    }

    if (req) {
      const me = await getMe(req);
      return {
        models: _models.default,
        me,
        secret,
        loaders: {
          user: new _dataloader.default(keys => _loaders.default.user.batchUsers(keys, _models.default)),
          category: new _dataloader.default(keys => _loaders.default.category.batchCategories(keys, _models.default))
        }
      };
    }

    return null;
  }
});
server.applyMiddleware({
  app,
  path: '/graphql'
}); // const httpServer = http.createServer(app);

const httpServer = _http.default.Server(app);

server.installSubscriptionHandlers(httpServer); // const isTest = !!process.env.TEST_DATABASE_URL;
// const isProduction = process.env.NODE_ENV === 'production';

const port = process.env.PORT || 8000;
(0, _models.connectDb)().then(async () => {
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
    console.log(`Config Link: ${_config2.default.LINK}`);
  });
});
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _graphqlResolvers = require("graphql-resolvers");

var _subscription = _interopRequireWildcard(require("../subscription"));

var _authorization = require("./authorization");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string => Buffer.from(string, 'base64').toString('ascii');

var _default = {
  Query: {
    messages: async (parent, {
      cursor,
      limit = 100
    }, {
      models
    }) => {
      const cursorOptions = cursor ? {
        createdAt: {
          $lt: fromCursorHash(cursor)
        }
      } : {};
      const messages = await models.Message.find(cursorOptions, null, {
        sort: {
          createdAt: -1
        },
        limit: limit + 1
      });
      const hasNextPage = messages.length > limit;
      const edges = hasNextPage ? messages.slice(0, -1) : messages;
      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: toCursorHash(edges[edges.length - 1].createdAt.toString())
        }
      };
    },
    message: async (parent, {
      id
    }, {
      models
    }) => {
      const result = await models.Message.findById(id);
      return result;
    }
  },
  Mutation: {
    createMessage: (0, _graphqlResolvers.combineResolvers)(_authorization.isAuthenticated, async (parent, {
      text
    }, {
      models,
      me
    }) => {
      const message = await models.Message.create({
        text,
        userId: me.id
      });

      _subscription.default.publish(_subscription.EVENTS.MESSAGE.CREATED, {
        messageCreated: {
          message
        }
      });

      return message;
    }),
    deleteMessage: (0, _graphqlResolvers.combineResolvers)(_authorization.isAuthenticated, _authorization.isMessageOwner, async (parent, {
      id
    }, {
      models
    }) => {
      const message = await models.Message.findById(id);

      if (message) {
        await message.remove();
        return true;
      }

      return false;
    })
  },
  Message: {
    user: async (message, args, {
      loaders
    }) => {
      const result = await loaders.user.load(message.userId);
      return result;
    }
  },
  Subscription: {
    messageCreated: {
      subscribe: () => _subscription.default.asyncIterator(_subscription.EVENTS.MESSAGE.CREATED)
    }
  }
};
exports.default = _default;
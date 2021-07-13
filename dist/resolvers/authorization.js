"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAuthenticated = isAuthenticated;
exports.isMessageOwner = isMessageOwner;
exports.isAdmin = void 0;

var _apolloServer = require("apollo-server");

var _graphqlResolvers = require("graphql-resolvers");

function isAuthenticated(parent, args, {
  me
}) {
  return me ? _graphqlResolvers.skip : new _apolloServer.ForbiddenError('Not authenticated as user.');
}

const isAdmin = (0, _graphqlResolvers.combineResolvers)(isAuthenticated, (parent, args, {
  me: {
    role
  }
}) => role === 'ADMIN' ? _graphqlResolvers.skip : new _apolloServer.ForbiddenError('Not authorized as admin.'));
exports.isAdmin = isAdmin;

async function isMessageOwner(parent, {
  id
}, {
  models,
  me
}) {
  const message = await models.Message.findById(id);

  if (message.userId != me.id) {
    throw new _apolloServer.ForbiddenError('Not authenticated as owner.');
  }

  return _graphqlResolvers.skip;
}
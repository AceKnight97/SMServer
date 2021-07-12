"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _apolloServerExpress = require("apollo-server-express");

var _default = (0, _apolloServerExpress.gql)`
  extend type Query {
    categories: [Category]
  }

  extend type Mutation {
    createCategory(name: String, parent: ID, icon: String): Category!
  }

  type Category {
    id: ID!
    ancestors: [String]
    parent: ID
    isActive: Boolean!
    name: String!
    user: User
    icon: String
  }
`;

exports.default = _default;
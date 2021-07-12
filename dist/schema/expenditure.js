"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _apolloServerExpress = require("apollo-server-express");

var _default = (0, _apolloServerExpress.gql)`
  extend type Query {
    expenditures(cursor: String, limit: Int): ExpenditureConnection
  }

  extend type Mutation {
    createExpenditure(expenditureInput: ExpenditureInput): Expenditure!
  }

  input ExpenditureInput {
    date: Date!
    title: String!
    spending: Float!
    detail: String
    category: ID!
  }

  type Expenditure {
    id: ID!
    date: Date!
    title: String!
    spending: Float!
    detail: String
    category: Category
  }

  type ExpenditureConnection {
    edges: [Expenditure!]!
    pageInfo: PageInfo!
  }

`;

exports.default = _default;
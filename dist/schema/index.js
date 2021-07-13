"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _apolloServerExpress = require("apollo-server-express");

var _user = _interopRequireDefault(require("./user"));

var _userSpending = _interopRequireDefault(require("./userSpending"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import messageSchema from "./message";
// import categorySchema from "./category";
// import expenditureSchema from "./expenditure";
const linkSchema = (0, _apolloServerExpress.gql)`
  scalar Date

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;
var _default = [linkSchema, _user.default, _userSpending.default // messageSchema,
// categorySchema,
// expenditureSchema,
];
exports.default = _default;
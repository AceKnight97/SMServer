"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _graphqlIsoDate = require("graphql-iso-date");

var _user = _interopRequireDefault(require("./user"));

var _userSpending = _interopRequireDefault(require("./userSpending"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import messageResolvers from "./message";
// import categoryResolvers from "./category";
// import expenditureResolvers from './expenditure';
const customScalarResolver = {
  Date: _graphqlIsoDate.GraphQLDateTime
};
var _default = [customScalarResolver, _user.default, _userSpending.default // messageResolvers,
// categoryResolvers,
// expenditureResolvers,
];
exports.default = _default;
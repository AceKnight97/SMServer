"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.connectDb = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _user = _interopRequireDefault(require("./user"));

var _setting = _interopRequireDefault(require("./setting"));

var _userSpending = _interopRequireDefault(require("./userSpending"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import Message from "./message";
// import Expenditure from "./expenditure";
// import Category from "./category";
const connectDb = () => {
  // if (process.env.TEST_DATABASE_URL) {
  //   return mongoose.connect(process.env.TEST_DATABASE_URL, {
  //     useNewUrlParser: true,
  //     useUnifiedTopology: true,
  //   });
  // }
  if (process.env.DATABASE_URL) {
    return _mongoose.default.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });
  }

  throw new Error("missing db url");
};

exports.connectDb = connectDb;
const models = {
  User: _user.default,
  Setting: _setting.default,
  UserSpending: _userSpending.default // Message,
  // Expenditure,
  // Category,

};
var _default = models;
exports.default = _default;
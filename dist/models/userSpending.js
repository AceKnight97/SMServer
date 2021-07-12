"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const userSpendingSchema = new _mongoose.default.Schema({
  date: {
    type: String,
    required: true
  },
  iso: {
    type: Date,
    required: true
  },
  utc: {
    type: Date,
    required: true
  },
  logs: [{
    _id: false,
    title: String,
    money: Number,
    details: String
  }],
  income: Number,
  notes: String,
  user: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const UserSpending = _mongoose.default.model('UserSpending', userSpendingSchema);

var _default = UserSpending;
exports.default = _default;
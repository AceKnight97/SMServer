"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const expenditureSchema = new _mongoose.default.Schema({
  date: Date,
  title: {
    type: String,
    required: true
  },
  spending: Number,
  detail: String,
  category: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Category'
  },
  user: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Expenditure = _mongoose.default.model('Expenditure', expenditureSchema);

var _default = Expenditure;
exports.default = _default;
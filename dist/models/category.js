"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const categorySchema = new _mongoose.default.Schema({
  ancestors: [String],
  parent: {
    type: String,
    ref: 'Category'
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  user: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'User'
  },
  icon: String,
  isDefault: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

const Category = _mongoose.default.model('Category', categorySchema);

var _default = Category;
exports.default = _default;
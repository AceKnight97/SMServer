"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const settingSchema = new _mongoose.default.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: _mongoose.default.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

const Setting = _mongoose.default.model('Setting', settingSchema);

var _default = Setting;
exports.default = _default;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _isEmail = _interopRequireDefault(require("validator/lib/isEmail"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable func-names */
const userSchema = new _mongoose.default.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: [_isEmail.default, "No valid email address provided."]
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 12
  },
  role: {
    type: String
  },
  // NEW
  status: {
    type: String
  },
  gender: {
    type: String
  },
  address: {
    type: String
  },
  phone: {
    type: String
  },
  dob: {
    type: Date
  },
  signUpDate: {
    type: Date
  },
  // END NEW
  isVerified: {
    type: Boolean
  },
  verificationCode: {
    type: String
  },
  forgotToken: {
    type: String
  },
  resetPasswordExpires: Date,
  userSpending: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'UserSpending'
  }
});

userSchema.statics.findByLogin = async function (username) {
  let user = await this.findOne({
    username: username
  });

  if (!user) {
    user = await this.findOne({
      email: username
    });
  }

  return user;
};

userSchema.pre("remove", function (next) {
  this.model("Message").deleteMany({
    userId: this._id
  }, next);
});
userSchema.pre("save", async function () {
  this.password = await this.generatePasswordHash();
});

userSchema.methods.generatePasswordHash = async function () {
  const saltRounds = 10;
  const result = await _bcrypt.default.hash(this.password, saltRounds);
  return result;
};

userSchema.methods.validatePassword = async function (password) {
  const result = await _bcrypt.default.compare(password, this.password);
  return result;
};

const User = _mongoose.default.model("User", userSchema);

var _default = User;
exports.default = _default;
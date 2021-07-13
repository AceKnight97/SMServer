"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _graphqlResolvers = require("graphql-resolvers");

var _apolloServer = require("apollo-server");

var _moment = _interopRequireDefault(require("moment"));

var _generatePassword = _interopRequireDefault(require("generate-password"));

var _authorization = require("./authorization");

var _email = _interopRequireDefault(require("../utils/email"));

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createToken = async (user, secret, expiresIn) => {
  const {
    id,
    email,
    username,
    role
  } = user;
  const token = await _jsonwebtoken.default.sign({
    id,
    email,
    username,
    role
  }, secret, {
    expiresIn
  });
  return token;
};

const getLogInfo = async (models, id) => {
  var _data$;

  const data = await models.UserSpending.find({
    user: id
  }).sort({
    iso: "asc"
  });
  let totalSpending = 0;
  let totalIncome = 0;

  if ((data === null || data === void 0 ? void 0 : data.length) !== 0) {
    _lodash.default.forEach(data, x => {
      const temp = _lodash.default.sumBy(x.logs || [], y => y.money);

      totalSpending += temp;
      totalIncome += x.income || 0;
    });
  }

  return {
    firstDate: (data === null || data === void 0 ? void 0 : (_data$ = data[0]) === null || _data$ === void 0 ? void 0 : _data$.date) || "",
    totalSpending,
    totalIncome,
    moneyLeft: totalIncome - totalSpending
  };
};

var _default = {
  Query: {
    users: async (parent, args, {
      models
    }) => {
      const users = await models.User.find();
      return users || [];
    },
    user: async (parent, {
      id
    }, {
      models
    }) => {
      const user = await models.User.findById(id);
      const {
        firstDate,
        totalIncome,
        totalSpending,
        moneyLeft
      } = await getLogInfo(models, id);

      _lodash.default.assign(user, {
        firstDate,
        totalIncome,
        totalSpending,
        moneyLeft
      });

      return user || {};
    },
    me: async (parent, args, {
      models,
      me
    }) => {
      if (!me) {
        return {};
      }

      const user = await models.User.findById(me.id);
      const {
        firstDate,
        totalIncome,
        totalSpending,
        moneyLeft
      } = await getLogInfo(models, me.id);

      _lodash.default.assign(user, {
        firstDate,
        totalIncome,
        totalSpending,
        moneyLeft
      });

      return user || {};
    }
  },
  Mutation: {
    signUp: async (parent, {
      username,
      email,
      password
    }, {
      models,
      secret
    }) => {
      const user = await models.User.create({
        username,
        email,
        password,
        isVerified: false,
        verificationCode: Math.floor(100000 + Math.random() * 900000),
        signUpDate: (0, _moment.default)()
      });

      _email.default.sendVerifyEmail(email, user.verificationCode);

      return {
        token: createToken(user, secret, "10m"),
        isSuccess: true
      };
    },
    signIn: async (parent, {
      username,
      password
    }, {
      models,
      secret
    }) => {
      const user = await models.User.findByLogin(username);

      if (!user) {
        throw new _apolloServer.UserInputError("No user found with this login credentials.");
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        const forgotPassword = await models.User.findOne({
          forgotToken: password,
          resetPasswordExpires: {
            $gt: Date.now()
          }
        });

        if (forgotPassword) {
          return {
            token: createToken(user, secret, "1h"),
            srp: true,
            isSuccess: true,
            user
          };
        }

        throw new _apolloServer.AuthenticationError("Invalid password.");
      }

      return {
        token: createToken(user, secret, "1h"),
        isSuccess: true,
        user
      };
    },
    updateUser: (0, _graphqlResolvers.combineResolvers)(_authorization.isAuthenticated, async (parent, args, {
      models,
      me
    }) => {
      const {
        profileInput
      } = args;
      const user = await models.User.findByIdAndUpdate(me.id, { ...profileInput
      }, {
        new: true
      });
      return {
        isSuccess: !!user
      };
    }),
    changePassword: (0, _graphqlResolvers.combineResolvers)(_authorization.isAuthenticated, async (parent, {
      password,
      newPassword
    }, {
      models,
      me
    }) => {
      try {
        const user = await models.User.findById(me.id);
        const isValid = await user.validatePassword(password);

        if (!isValid) {
          throw new _apolloServer.AuthenticationError("Invalid password.");
        }

        const userNewPassword = await models.User.findByIdAndUpdate(me.id, {
          password: newPassword
        }, {
          new: true
        });
        userNewPassword.save();
        return {
          token: createToken(userNewPassword, process.env.SECRET, "1h"),
          isSuccess: true
        };
      } catch (error) {
        return {
          isSuccess: false,
          message: `${error}`
        };
      }
    }),
    deleteUser: (0, _graphqlResolvers.combineResolvers)(_authorization.isAdmin, async (parent, {
      id
    }, {
      models
    }) => {
      const user = await models.User.findById(id);

      if (user) {
        await user.remove();
        return true;
      }

      return false;
    }),
    verifiedEmail: (0, _graphqlResolvers.combineResolvers)(_authorization.isAuthenticated, async (parent, {
      verificationCode
    }, {
      models,
      me
    }) => {
      try {
        const verified = await models.User.findOneAndUpdate({
          verificationCode,
          _id: me.id
        }, {
          isVerified: true,
          verificationCode: ""
        });
        return {
          isSuccess: Boolean(verified)
        };
      } catch (error) {
        return {
          isSuccess: false,
          message: error
        };
      }
    }),
    forgotPassword: async (parent, {
      email
    }, {
      models
    }) => {
      const user = await models.User.findOneAndUpdate({
        email
      }, {
        forgotToken: Math.floor(100000 + Math.random() * 900000),
        resetPasswordExpires: (0, _moment.default)().add(1, "h")
      }, {
        new: true
      });

      _email.default.sendForgotPassword(email, user.forgotToken);

      return {
        isSuccess: Boolean(user)
      };
    },
    resetPassword: async (parent, {
      verificationCode,
      password
    }, {
      models
    }) => {
      try {
        const user = await models.User.findOne({
          forgotToken: verificationCode
        });

        if (!user.forgotToken) {
          throw new _apolloServer.AuthenticationError("Invalid verification code.");
        }

        const userNewPassword = await models.User.findByIdAndUpdate(user._id, {
          password,
          forgotToken: "",
          resetPasswordExpires: undefined
        }, {
          new: true
        });
        userNewPassword.save();
        return {
          token: createToken(userNewPassword, process.env.SECRET, "10m"),
          isSuccess: true
        };
      } catch (error) {
        return {
          isSuccess: false,
          message: `${error}`
        };
      }
    }
  },
  User: {// messages: async (user, args, { models }) => {
    //   const messages = await models.Message.find({
    //     userId: user.id,
    //   });
    //   return messages;
    // },
  }
};
exports.default = _default;
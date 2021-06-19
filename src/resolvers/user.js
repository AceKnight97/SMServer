import jwt from "jsonwebtoken";
import { combineResolvers } from "graphql-resolvers";
import { AuthenticationError, UserInputError } from "apollo-server";
import moment from "moment";
import generator from "generate-password";

import { isAdmin, isAuthenticated } from "./authorization";
import Email from "../utils/email";
import _ from "lodash";

const createToken = async (user, secret, expiresIn) => {
  const { id, email, username, role } = user;
  const token = await jwt.sign({ id, email, username, role }, secret, {
    expiresIn,
  });
  return token;
};

const getLogInfo = async (models, id) => {
  const data = await models.UserSpending.find({
    user: id,
  }).sort({ iso: 'asc' });
  let totalSpending = 0;
  let totalIncome = 0;

  if (data?.length!==0) {
    _.forEach(data, x => {
      const temp = _.sumBy(x.logs || [], y => y.money);
      totalSpending += temp;
      totalIncome += x.income || 0;
    })
  }
  return {
    firstDate: data[0].date||'',
    totalSpending,
    totalIncome,
  }
};

export default {
  Query: {
    users: async (parent, args, { models }) => {
      const users = await models.User.find();
      return users || [];
    },
    user: async (parent, { id }, { models }) => {
      const user = await models.User.findById(id);
      const {
        firstDate, totalIncome, totalSpending
      } = await getLogInfo(models, id);
      _.assign(user, { firstDate, totalIncome, totalSpending });
      return user || {};
    },
    me: async (parent, args, { models, me }) => {
      if (!me) {
        return {};
      }
      const user = await models.User.findById(me.id);
      const {
        firstDate, totalIncome, totalSpending
      } = await getLogInfo(models, me.id);
      _.assign(user, { firstDate, totalIncome, totalSpending });
      return user || {};
    },
  },

  Mutation: {
    signUp: async (
      parent,
      { username, email, password },
      { models, secret }
    ) => {
      const user = await models.User.create({
        username,
        email,
        password,
        isVerified: false,
        verificationCode: Math.floor(100000 + Math.random() * 900000),
        signUpDate: moment(),
      });
      Email.sendVerifyEmail(email, user.verificationCode);
      return { token: createToken(user, secret, "10m"), isSuccess: true };
    },

    signIn: async (parent, { username, password }, { models, secret }) => {
      const user = await models.User.findByLogin(username);

      if (!user) {
        throw new UserInputError("No user found with this login credentials.");
      }
      const isValid = await user.validatePassword(password);
      if (!isValid) {
        const forgotPass = await models.User.findOne({
          forgotToken: password,
          resetPasswordExpires: { $gt: Date.now() },
        });
        if (forgotPass) {
          return {
            token: createToken(user, secret, "1h"),
            srp: true,
            isSuccess: true,
            user,
          };
        }
        throw new AuthenticationError("Invalid password.");
      }

      return { token: createToken(user, secret, "1h"), isSuccess: true, user };
    },

    updateUser: combineResolvers(
      isAuthenticated,
      async (parent, args, { models, me }) => {
        const { profileInput } = args;
        const user = await models.User.findByIdAndUpdate(
          me.id,
          { ...profileInput },
          { new: true }
        );
        return { isSuccess: !!user };
      }
    ),

    deleteUser: combineResolvers(
      isAdmin,
      async (parent, { id }, { models }) => {
        const user = await models.User.findById(id);

        if (user) {
          await user.remove();
          return true;
        }
        return false;
      }
    ),

    verifiedEmail: combineResolvers(
      isAuthenticated,
      async (parent, { verificationCode }, { models, me }) => {
        try {
          const verified = await models.User.findOneAndUpdate(
            { verificationCode, _id: me.id },
            {
              isVerified: true,
              verificationCode: "",
            }
          );
          return {
            isSuccess: Boolean(verified),
          };
        } catch (error) {
          return {
            isSuccess: false,
            message: error,
          };
        }
      }
    ),

    forgotPass: async (parent, { email }, { models }) => {
      const user = await models.User.findOneAndUpdate(
        { email },
        {
          forgotToken: generator.generate({
            length: 10,
            numbers: true,
          }),
          resetPasswordExpires: moment().add(1, "h"),
        },
        { new: true }
      );
      Email.sendForgotPassword(email, user.forgotToken);
      return Boolean(user);
    },

    resetPassword: combineResolvers(
      isAuthenticated,
      async (parent, { password }, { models, me }) => {
        const user = await models.User.findById(me.id);
        if (!user.forgotToken) {
          throw new AuthenticationError("Invalid password.");
        }
        const userNewPassword = await models.User.findByIdAndUpdate(
          me.id,
          {
            password,
            forgotToken: "",
            resetPasswordExpires: undefined,
          },
          { new: true }
        );
        userNewPassword.save();
        return {
          token: createToken(userNewPassword, process.env.SECRET, "10m"),
        };
      }
    ),

    changePassword: combineResolvers(
      isAuthenticated,
      async (parent, { password, newPassword }, { models, me }) => {
        const user = await models.User.findById(me.id);
        const isValid = await user.validatePassword(password);
        if (!isValid) {
          throw new AuthenticationError("Invalid password.");
        }
        const userNewPassword = await models.User.findByIdAndUpdate(
          me.id,
          { password: newPassword },
          { new: true }
        );
        userNewPassword.save();
        return {
          token: createToken(userNewPassword, process.env.SECRET, "1h"),
        };
      }
    ),
  },

  User: {
    // messages: async (user, args, { models }) => {
    //   const messages = await models.Message.find({
    //     userId: user.id,
    //   });
    //   return messages;
    // },
  },
};

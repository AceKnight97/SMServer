"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _graphqlResolvers = require("graphql-resolvers");

var _authorization = require("./authorization");

var _moment = _interopRequireDefault(require("moment"));

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const fromCursorHash = (string) =>
//   Buffer.from(string, "base64").toString("ascii");
// const toCursorHash = (string) => Buffer.from(string).toString("base64");
const timeIso = x => (0, _moment.default)(x, "DD/MM/YYYY").toISOString();

const timeUtc = x => (0, _moment.default)(x, "DD/MM/YYYY").utc();

const SPENDING_MESSAGES = {
  DUPLICATED_DATE: "DUPLICATED_DATE",
  NO_INFO: "NO_INFO",
  INVALID_DATE: "INVALID_DATE"
};
const {
  DUPLICATED_DATE,
  NO_INFO,
  INVALID_DATE
} = SPENDING_MESSAGES;
const INVALID_DATE_FORMAT = {
  isSuccess: false,
  message: INVALID_DATE
};
var _default = {
  Query: {
    dailyInfo: async (parent, {
      date
    }, {
      models,
      me
    }) => {
      const data = await models.UserSpending.findOne({
        date,
        user: me.id
      });

      if (_lodash.default.isEmpty(data)) {
        return null;
      }

      const tempObj = {
        id: data._id,
        date: data.date,
        logs: data.logs,
        income: data.income,
        notes: data.notes
      };
      return tempObj;
    },
    insight: async (parent, {
      from,
      to
    }, {
      models,
      me
    }) => {
      const data = await models.UserSpending.find({
        user: me.id,
        iso: {
          $gte: timeIso(from),
          $lte: timeIso(to)
        }
      }).sort({
        iso: 'asc'
      });
      return _lodash.default.map(data, x => ({
        id: x._id,
        date: x.date,
        logs: x.logs,
        income: x.income,
        notes: x.notes
      }));
    }
  },
  Mutation: {
    addDailyInfo: (0, _graphqlResolvers.combineResolvers)(_authorization.isAuthenticated, async (parent, {
      input
    }, {
      models,
      me
    }) => {
      const {
        date
      } = input;
      const data = await models.UserSpending.findOne({
        date,
        user: me.id
      });

      if (data) {
        return {
          isSuccess: false,
          message: DUPLICATED_DATE
        };
      }

      input.user = me.id;

      try {
        await models.UserSpending.create({ ...input,
          iso: timeIso(date),
          utc: timeUtc(date)
        });
        return {
          isSuccess: true
        };
      } catch (error) {
        return {
          isSuccess: false,
          message: error
        };
      }
    }),
    updateLogs: (0, _graphqlResolvers.combineResolvers)(_authorization.isAuthenticated, async (parent, {
      input
    }, {
      models,
      me
    }) => {
      const {
        id,
        logs
      } = input;

      try {
        await models.UserSpending.findOneAndUpdate({
          user: me.id,
          _id: id
        }, {
          logs
        });
        return {
          isSuccess: true
        };
      } catch (error) {
        return {
          isSuccess: false,
          message: error
        };
      }
    }),
    updateIncome: (0, _graphqlResolvers.combineResolvers)(_authorization.isAuthenticated, async (parent, {
      input
    }, {
      models,
      me
    }) => {
      const {
        id,
        income,
        notes
      } = input;

      try {
        await models.UserSpending.findOneAndUpdate({
          user: me.id,
          _id: id
        }, {
          income,
          notes
        });
        return {
          isSuccess: true
        };
      } catch (error) {
        return {
          isSuccess: false,
          message: error
        };
      }
    })
  }
};
exports.default = _default;
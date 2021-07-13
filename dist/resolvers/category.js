"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _graphqlResolvers = require("graphql-resolvers");

var _authorization = require("./authorization");

var _default = {
  Query: {
    categories: async (parent, args, {
      models,
      me
    }) => {
      const criteria = {
        $or: [{
          isDefault: true
        }, {
          user: me.id
        }],
        isActive: true
      };
      const categories = await models.Category.find(criteria);
      return categories;
    }
  },
  Mutation: {
    createCategory: (0, _graphqlResolvers.combineResolvers)(_authorization.isAuthenticated, async (parent, {
      name,
      parent: parentCategoryId,
      icon
    }, {
      models,
      me
    }) => {
      const categoryObj = {
        name,
        parent: parentCategoryId,
        icon,
        isDefault: false,
        isActive: true,
        user: me.id
      };

      if (parentCategoryId) {
        const parentCategory = await models.Category.findById(parentCategoryId);
        const {
          ancestors
        } = parentCategory || {
          ancestors: []
        };
        ancestors.push(parentCategoryId);
        categoryObj.ancestors = ancestors;
      }

      const category = await models.Category.create(categoryObj);
      return category;
    })
  },
  Category: {
    user: async (category, args, {
      loaders
    }) => {
      if (category.user) {
        const result = await loaders.user.load(category.user);
        return result;
      }

      return null;
    }
  }
};
exports.default = _default;
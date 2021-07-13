"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.batchCategories = void 0;

const batchCategories = async (keys, models) => {
  const categories = await models.Category.find({
    _id: {
      $in: keys
    }
  });
  return keys.map(key => categories.find(category => category.id == key));
};

exports.batchCategories = batchCategories;
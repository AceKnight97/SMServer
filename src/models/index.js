import mongoose from "mongoose";

import User from "./user";
import UserSpending from "./userSpending";

const connectDb = () => {
  if (process.env.DATABASE_URL) {
    return mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
  }
  throw new Error("missing db url");
};

const models = {
  User,
  UserSpending,
};

export {
  connectDb
};

export default models;
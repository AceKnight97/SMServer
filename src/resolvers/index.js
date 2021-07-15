import { GraphQLDateTime } from "graphql-iso-date";

import userResolvers from "./user";
import userSpendingResolvers from "./userSpending";

const customScalarResolver = {
  Date: GraphQLDateTime,
};

export default [
  customScalarResolver,
  userResolvers,
  userSpendingResolvers,
];

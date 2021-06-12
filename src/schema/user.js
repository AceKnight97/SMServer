import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    users: [User]!
    user(id: ID!): User
    me: User
  }

  extend type Mutation {
    signUp(username: String!, email: String!, password: String!): SignUpData!

    signIn(username: String!, password: String!): SignInData!
   
    updateUser(profileInput: ProfileInput!): MutationResponse!
    deleteUser(id: ID!): MutationResponse!
    verifiedEmail(verificationCode: String!): MutationResponse!
    changePassword(password: String!, newPassword: String): MutationResponse!
    resetPassword(password: String!): MutationResponse!
    forgotPass(email: String!): Boolean!
  }

  input ProfileInput {
    username: String!
    gender: String
    address: String
    phone: String
    dob: Date
  }

  type SignUpData {
    token: String!
    isSuccess: Boolean
  }

  type SignInData {
    token: String!
    isSuccess: Boolean
    user: User
  }

  type User {
    id: ID!
    username: String!
    email: String!
    role: String
    signUpDate: Date
    # NEW FIELDS
    status: String
    gender: String
    address: String
    phone: String
    dob: Date
    isVerified: Boolean
  }

  type MutationResponse {
    isSuccess: Boolean!
    message: String
  }
`;

import { ApolloError, AuthenticationError } from "apollo-server-core";
import { arg, extendType, nonNull, objectType, stringArg } from "nexus";
import { generateToken } from "../helpers/authToken";
import { comparePassword, hashPassword } from "../helpers/hashPassword";
import { validateRegisterSchema } from "../validations/registerSchema";
import { NexusGenObjects } from "../../nexus-typegen";

export const User = objectType({
  name: "User",
  definition(t) {
    t.int("id");
    t.string("firstName");
    t.string("lastName");
    t.string("email");
    t.string("password");
    t.string("token");
    t.dateTime("createdAt");
    t.dateTime("updatedAt");
    t.nonNull.list.field("tasks", {
      type: "Task",
      resolve(root, _args, ctx) {
        const { prisma } = ctx;
        return prisma.user
          .findUnique({
            where: {
              id: root.id as number | undefined,
            },
          })
          .task();
      },
    });
    t.nonNull.list.field("categories", {
      type: "Category",
      resolve(root, _args, ctx) {
        const { prisma } = ctx;
        return prisma.user
          .findUnique({
            where: {
              id: root.id as number | undefined,
            },
          })
          .category();
      },
    });
  },
});

export const UserQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.field("allUsers", {
      type: "User",
      resolve(_root, _args, ctx) {
        const { prisma } = ctx;
        return prisma.user.findMany();
      },
    });
  },
});

export const UserMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("userRegister", {
      type: "User",
      args: {
        firstName: nonNull(stringArg()),
        lastName: nonNull(stringArg()),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx) {
        const { firstName, lastName, email, password } = args;
        const { prisma } = ctx;
        // validateRegisterSchema({ firstName, lastName, email, password });
        const findUser = await prisma.user.findUnique({
          where: {
            email,
          },
        });
        if (findUser) throw new AuthenticationError("Email arleady exist");
        const secretPassword = hashPassword(password);
        const createUser = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: secretPassword,
          },
        });
        if (!createUser) throw new ApolloError("Error occured creating user");
        const token = generateToken({
          id: createUser.id,
          email: createUser.email,
        });
        return {
          firstName: createUser.firstName,
          lastName: createUser.lastName,
          email: createUser.email,
          password: createUser.password,
          token,
        };
      },
    });
    t.field("userLogin", {
      type: "User",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx) {
        const { prisma } = ctx;
        const { email, password } = args;
        const findUser = await prisma.user.findUnique({
          where: {
            email,
          },
        });
        if (!findUser) throw new AuthenticationError("Email doesn't exist");
        const compare = comparePassword(password, findUser.password);
        if (!compare)
          throw new AuthenticationError("User password is incorrect");
        const token = generateToken({
          id: findUser.id,
          email: findUser.email,
        });
        return {
          firstName: findUser.email,
          lastName: findUser.lastName,
          email: findUser.email,
          password: findUser.password,
          token,
        };
      },
    });
  },
});

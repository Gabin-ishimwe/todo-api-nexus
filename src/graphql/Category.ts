import { AuthenticationError, UserInputError } from "apollo-server-core";
import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import { Category as CategoryType, Task } from "../typeDefs";

export const Category = objectType({
  name: "Category",
  definition(t) {
    t.int("id");
    t.string("name");
    t.dateTime("createdAt");
    t.dateTime("updatedAt");
    t.nonNull.list.field("tasks", {
      type: "Task",
      // @ts-ignore
      resolve(root, _args, ctx) {
        const { prisma } = ctx;
        return prisma.category
          .findUnique({
            where: {
              id: root.id as number | undefined,
            },
          })
          .tasks();
      },
    });
  },
});

export const CategoryQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.field("categories", {
      type: "Category",
      resolve(_root, _args, ctx) {
        const { prisma, userId } = ctx;
        if (!userId) throw new AuthenticationError("User not logged in");
        return prisma.category.findMany();
      },
    });
    t.nonNull.field("ReadCategory", {
      type: "Category",
      args: {
        id: nonNull(intArg()),
      },
      // @ts-ignore
      async resolve(root, args, ctx) {
        const { prisma, userId } = ctx;
        if (!userId) throw new AuthenticationError("User not logged in");
        const category = await prisma.category.findUnique({
          where: {
            id: args.id,
          },
        });
        if (!category) throw new UserInputError("Category doesn't exist");
        return category;
      },
    });
  },
});

export const CategoryMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("addCategory", {
      type: "Category",
      args: {
        name: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx) {
        const { prisma, userId } = ctx;
        const { name } = args;
        if (!userId) throw new AuthenticationError("User not logged in");
        const findCategory = await prisma.category.findUnique({
          where: { name },
        });
        if (findCategory) throw new UserInputError("Category arleady exists");
        return prisma.category.create({
          data: {
            name,
            userId,
          },
        });
      },
    });
    t.field("updateCategory", {
      type: "Category",
      args: {
        id: nonNull(intArg()),
        name: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx) {
        const { prisma, userId } = ctx;
        const { id, name } = args;
        if (!userId) throw new AuthenticationError("User not logged in");
        const findCategory = await prisma.category.findUnique({
          where: {
            id,
          },
        });
        if (!findCategory) throw new UserInputError("Category doesn't exist");
        return prisma.category.update({
          where: {
            id,
          },
          data: {
            name,
          },
        });
      },
    });
    t.field("deleteCategory", {
      type: "Category",
      args: {
        id: nonNull(intArg()),
      },
      async resolve(_root, args, ctx) {
        const { prisma, userId } = ctx;
        const { id } = args;
        if (!userId) throw new AuthenticationError("User not logged in");
        const findCategory = await prisma.category.findUnique({
          where: {
            id,
          },
        });
        if (!findCategory) throw new UserInputError("Category doesn't exist");
        return prisma.category.delete({
          where: {
            id,
          },
        });
      },
    });
  },
});

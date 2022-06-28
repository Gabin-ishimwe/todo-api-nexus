import { Prisma, prisma } from "@prisma/client";
import { AuthenticationError, UserInputError } from "apollo-server-core";
import {
  objectType,
  extendType,
  nonNull,
  stringArg,
  arg,
  intArg,
  enumType,
  inputObjectType,
  list,
} from "nexus";

export const Task = objectType({
  name: "Task",
  definition(t) {
    t.int("id");
    t.string("title");
    t.string("description");
    t.boolean("isDone");
    t.dateTime("createdAt");
    t.dateTime("updatedAt");
    t.nonNull.field("category", {
      type: "Category",
      // @ts-ignore
      resolve(root, args, ctx) {
        const { prisma } = ctx;
        return prisma.task
          .findUnique({
            where: {
              id: root.id as number | undefined,
            },
          })
          .category();
      },
    });
    t.nonNull.field("user", {
      type: "User",
      // @ts-ignore
      resolve: (root, args, ctx) => {
        const { prisma } = ctx;
        return prisma.task
          .findUnique({
            where: {
              id: root.id as number | undefined,
            },
          })
          .user();
      },
    });
  },
});

export const Feed = objectType({
  name: "Feed",
  definition(t) {
    t.nonNull.list.nonNull.field("tasks", { type: "Task" }),
      t.nonNull.int("count");
    t.id("id");
  },
});

export const Sort = enumType({
  name: "SortInput",
  members: ["asc", "desc"],
});

export const Sorting = inputObjectType({
  name: "SortingTasks",
  definition(t) {
    t.field("title", {
      type: "SortInput",
    }),
      t.field("createdAt", {
        type: "SortInput",
      });
  },
});

export const PostQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("feed", {
      type: "Feed",
      args: {
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(Sorting)) }),
      },
      async resolve(_root, args, ctx) {
        const { prisma, userId } = ctx;
        if (!userId) throw new AuthenticationError("User not logged in");
        const where = {
          skip: args?.skip as number | undefined,
          take: args?.take as number | undefined,
          orderBy: args?.orderBy as
            | Prisma.Enumerable<Prisma.TaskOrderByWithRelationInput>
            | undefined,
        };
        const tasks = await prisma.task.findMany(where);

        const count = await prisma.task.count(where);
        const id = `main-feed : ${JSON.stringify(args)}`;

        return {
          tasks,
          count,
          id,
        };
      },
    });
    t.nonNull.list.field("allMarkDone", {
      type: "Task",
      resolve(_root, args, ctx) {
        const { prisma, userId } = ctx;
        if (!userId) throw new AuthenticationError("User not logged in");
        return prisma.task.findMany({
          where: {
            isDone: true,
          },
        });
      },
    });
    t.nonNull.field("ReadTask", {
      type: "Task",
      args: {
        id: nonNull(intArg()),
      },
      // @ts-ignore
      async resolve(root, args, ctx) {
        const { prisma, userId } = ctx;
        if (!userId) throw new AuthenticationError("User not logged in");
        const task = await prisma.task.findUnique({
          where: {
            id: args.id,
          },
        });
        if (!task) throw new UserInputError("Task doesn't exist");
        return task;
      },
    });
  },
});

export const PostMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createTask", {
      type: "Task",
      args: {
        categoryId: nonNull(intArg()),
        title: nonNull(stringArg()),
        description: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx) {
        const { title, description, categoryId } = args;
        const { prisma, userId } = ctx;
        if (!userId) throw new AuthenticationError("User not logged in");
        const findCategory = await prisma.category.findUnique({
          where: {
            id: categoryId,
          },
        });
        if (!findCategory) throw new UserInputError("Category doesn't exist");
        return prisma.task.create({
          data: {
            title,
            description,
            categoryId,
            userId,
          },
        });
      },
    });
    t.field("markDone", {
      type: "Task",
      args: {
        id: nonNull(intArg()),
      },
      async resolve(_root, args, ctx) {
        const { id } = args;
        const { prisma, userId } = ctx;
        if (!userId) throw new AuthenticationError("User not logged in");
        const findPost = await prisma.task.findUnique({ where: { id } });
        if (!findPost) {
          throw new UserInputError("Task doesn't exist");
        }
        return prisma.task.update({
          data: {
            isDone: true,
          },
          where: {
            id,
          },
        });
      },
    });
    t.field("updateTask", {
      type: "Task",
      args: {
        id: nonNull(intArg()),
        title: stringArg(),
        description: stringArg(),
      },
      async resolve(_root, args, ctx) {
        const { title, description, id } = args;
        const { prisma, userId } = ctx;
        if (!userId) throw new AuthenticationError("User not logged in");
        const findTask = await prisma.task.findUnique({
          where: {
            id,
          },
        });
        if (!findTask) throw new UserInputError("Task doesn't exist");

        return prisma.task.update({
          where: {
            id,
          },
          data: {
            title,
            description,
          },
        });
      },
    });
    t.nonNull.field("deleteTask", {
      type: "Task",
      args: {
        id: nonNull(intArg()),
      },
      async resolve(_root, args, ctx) {
        const { id } = args;
        const { prisma, userId } = ctx;
        if (!userId) throw new AuthenticationError("User not logged in");
        const findTask = await prisma.task.findUnique({
          where: {
            id,
          },
        });
        if (!findTask) throw new UserInputError("Task doesn't exist");

        return prisma.task.delete({
          where: {
            id,
          },
        });
      },
    });
    t.field("markAllDone", {
      type: "Task",
      // @ts-ignore
      resolve(_root, args, ctx) {
        const { prisma, userId } = ctx;
        if (!userId) throw new AuthenticationError("User not logged in");
        return prisma.task.updateMany({
          data: {
            isDone: true,
          },
          where: {
            isDone: false,
          },
        });
      },
    });
  },
});

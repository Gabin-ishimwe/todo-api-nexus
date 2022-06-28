import { PrismaClient } from "@prisma/client";
import { Request } from "express";
import { decodeToken } from "./helpers/authToken";
import { authorizationHeader } from "./utils/auth";

const prisma = new PrismaClient();
export type ContextType = {
  prisma: PrismaClient;
  userId?: number;
};

export const context = ({ req }: { req: Request }): ContextType => {
  const token =
    req && req.headers.authorization
      ? authorizationHeader(req.headers.authorization)
      : null;

  return {
    prisma,
    userId: token?.id,
  };
};

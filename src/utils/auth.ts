import { decodeToken } from "../helpers/authToken";
import "dotenv/config";
import { AuthenticationError } from "apollo-server-core";
import { Jwt } from "jsonwebtoken";

export type AuthHeaders = {
  id: number;
  email: string;
};

export const authorizationHeader = (authHeader: string): AuthHeaders => {
  const token = authHeader.replace("Bearer ", "");
  if (!token) throw new AuthenticationError("No token found");
  return decodeToken(token) as unknown as AuthHeaders;
};

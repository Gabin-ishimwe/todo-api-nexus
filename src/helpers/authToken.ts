import * as jwt from "jsonwebtoken";
import "dotenv/config";
import { AuthHeaders } from "../utils/auth";

export const generateToken = (payload: object) => {
  //@ts-ignore
  const token = jwt.sign(payload, process.env.SECRET_TOKEN, {
    expiresIn: "1d",
  });
  return token;
};

export const decodeToken = (payload: string): AuthHeaders => {
  //@ts-ignore
  const verify = jwt.verify(payload, process.env.SECRET_TOKEN);
  return verify as unknown as AuthHeaders;
};

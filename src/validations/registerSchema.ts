import { ValidationError } from "apollo-server-core";
import joi from "joi";

const registerSchema = joi.object({
  firstName: joi.string().required().message("First name is required"),
  lastName: joi.string().required().message("Last name is required"),
  email: joi.string().email().required().message("Email is required"),
  password: joi
    .string()
    .pattern(/^(?=.*[A-Z])(?=.*[0-9])\w{8,}$/)
    .required()
    .message("password is required"),
});

export const validateRegisterSchema = (schema: object) => {
  const value = registerSchema.validate(schema);
  console.log(value);
  return value;
};

import { AuthenticationError } from "apollo-server-core";
import { Context } from "../types/Context";
import { MiddlewareFn } from "type-graphql";

export const checkAuth: MiddlewareFn<Context> = async (
  { context: { req } },
  next
) => {
  if (!req.session.userId) {
    console.log({ session: req.session });

    throw new AuthenticationError(
      "not authentication to perform GraphQL operations"
    );
  }

  return next();
};

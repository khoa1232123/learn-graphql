import argon2 from "argon2";
import { User } from "../entities/User";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { LoginInput, RegisterInput } from "../types/UserInput";
import { validateRegisterInput } from "../utils/validateRegisterInput";
import { Context } from "../types/Context";

@Resolver()
export class UserResolver {
  @Mutation((_return) => UserMutationResponse)
  async register(
    @Arg("registerInput") { email, password, username }: RegisterInput
  ): Promise<UserMutationResponse> {
    const validateRegisterInputErrors = validateRegisterInput({
      email,
      password,
      username,
    });

    if (validateRegisterInputErrors) {
      return {
        code: 400,
        success: false,
        ...validateRegisterInputErrors,
      };
    }

    try {
      const existingUser = await User.findOne({
        where: [{ username }, { email }],
      });

      if (existingUser) {
        return {
          code: 400,
          success: false,
          message: "Duplicated username or email",
          errors: [
            {
              field: existingUser.username === username ? "username" : "email",
              message: `${
                existingUser.username === username ? "Username" : "Email"
              } already taken`,
            },
          ],
        };
      }

      const hashedPassword = await argon2.hash(password);

      const newUser = User.create({
        username,
        password: hashedPassword,
        email,
      });

      const createdUser = await User.save(newUser);

      return {
        code: 400,
        success: false,
        message: "Duplicated username or email",
        user: createdUser,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `Internal server error: ${error.message}`,
      };
    }
  }

  @Mutation((_return) => UserMutationResponse)
  async login(
    @Arg("loginInput") { usernameOrEmail, password }: LoginInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    try {
      const existingUser = await User.findOne(
        usernameOrEmail.includes("@")
          ? { email: usernameOrEmail }
          : { username: usernameOrEmail }
      );
      if (!existingUser) {
        return {
          code: 400,
          success: false,
          message: `User not found`,
          errors: [
            {
              field: "usernameOrEmail",
              message: "Username or email incorrect",
            },
          ],
        };
      }
      const passwordValid = await argon2.verify(
        existingUser.password,
        password
      );

      if (!passwordValid) {
        return {
          code: 500,
          success: false,
          message: `User not found`,
          errors: [
            {
              field: "usernameOrEmail",
              message: "Username or email incorrect",
            },
          ],
        };
      }

      // Create Session and return Cookie
      req.session.userId = existingUser.id;

      return {
        code: 200,
        success: true,
        message: `Logged in successfully`,
        user: existingUser,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `Internal server error: ${error.message}`,
      };
    }
  }

  // @Mutation((_return) => Boolean)
  // async logout(@Ctx() { req, res }: Context): Promise<boolean> {
  //   res.clearCookie(COOKIE_NAME);

  //   return true;
  // }
}

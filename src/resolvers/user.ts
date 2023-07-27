import argon2 from "argon2";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { COOKIE_NAME } from "../constants";
import { User } from "../entities/User";
import { Context } from "../types/Context";
import { DataMutationResponse } from "../types/DataMutationResponse";
import { ForgotPasswordInput, LoginInput, RegisterInput } from "../types/UserInput";
import { validateRegisterInput } from "../utils/validateRegisterInput";
import { sendEmail } from "../utils/sendEmail";

@Resolver()
export class UserResolver {
  @Query((_return) => DataMutationResponse)
  async me(@Ctx() { req }: Context): Promise<DataMutationResponse> {
    try {
      if (!req.session.userId) {
        return {
          code: 400,
          success: false,
          message: `Ban can login`,
        };
      }

      const user = await User.findOne(req.session.userId);

      return {
        code: 200,
        success: true,
        message: `get user successfully`,
        user: user,
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

  @Mutation((_return) => DataMutationResponse)
  async register(
    @Arg("registerInput") { email, password, username }: RegisterInput,
    @Ctx() { req }: Context
  ): Promise<DataMutationResponse> {
    const validateRegisterInputErrors = validateRegisterInput({
      email,
      password,
      username,
    });

    console.log({ email, password, username });

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

      req.session.userId = createdUser.id;

      return {
        code: 200,
        success: true,
        message: "User registration successfully",
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

  @Mutation((_return) => DataMutationResponse)
  async login(
    @Arg("loginInput") { usernameOrEmail, password }: LoginInput,
    @Ctx() { req }: Context
  ): Promise<DataMutationResponse> {
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
              field: "password",
              message: "password wrong!",
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

  @Mutation((_return) => Boolean)
  async logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME);
      req.session.destroy((error) => {
        if (error) {
          console.log("Detroying session error", error);
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  @Mutation(_return => Boolean)
  async forgotPassword(@Arg('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput): Promise<DataMutationResponse>{
    try {
      const user = await User.findOne({email: forgotPasswordInput.email});

      if(!user) return {
        code: 400,
        success: false,
        message: `email khong dung ban can, ban co the dien lai email`,
      };

      let token = "afoapijsdpfo"

      await sendEmail(forgotPasswordInput.email, ` <a href="http://localhost:3000/change-password?token=${token}">Click here to reset your password</a>`)

      return {
        code: 200,
        success: true,
        message: `Chung toi vua gui cho ban 1 email ban co the vao gmail de kiem tra`,
      }

    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `Internal server error: ${error.message}`,
      };
    }
  }
}

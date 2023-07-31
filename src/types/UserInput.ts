import { Field, InputType } from "type-graphql";

@InputType()
export class RegisterInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class LoginInput {
  @Field()
  usernameOrEmail: string;

  @Field()
  password: string;
}

@InputType()
export class ForgotPasswordInput {
  @Field()
  email: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  userId: string;
  
  @Field()
  token: string;

  @Field()
  newPassword: string
}

import { Post } from "../entities/Post";
import { Field, ObjectType } from "type-graphql";
import { FieldError } from "./FieldError";
import { IMutationResponse } from "./MutationResponse";
import { User } from "../entities/User";

@ObjectType({ implements: IMutationResponse })
export class DataMutationResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  // @Field((_type) => ([Post] || Post || User), { nullable: true })
  // data?: Post | User | Post[];

  @Field({ nullable: true })
  post?: Post;

  @Field((_type) => [Post], { nullable: true })
  posts?: Post[];

  @Field({ nullable: true })
  user?: User;

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}

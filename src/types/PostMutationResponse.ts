import { Post } from "../entities/Post";
import { Field, ObjectType } from "type-graphql";
import { FieldError } from "./FieldError";
import { IMutationResponse } from "./MutationResponse";

@ObjectType({ implements: IMutationResponse })
export class PostMutationResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field({ nullable: true })
  post?: Post;

  @Field({ nullable: true })
  posts?: Post[];

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}

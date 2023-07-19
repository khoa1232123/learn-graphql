import { DataMutationResponse } from "../types/DataMutationResponse";
import { Post } from "../entities/Post";
import { CreatePostInput, UpdatePostInput } from "../types/PostInput";
import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
// import { PostMutationResponse } from "../types/PostMutationResponse";

@Resolver()
export class PostResolver {
  @Mutation(_return => DataMutationResponse)
  async createPost(@Arg('createPostInput') {title, text}: CreatePostInput): Promise<DataMutationResponse>{
    try {
      const newPost = Post.create({title, text})      
      await newPost.save()

      return {
        code: 200,
        success: true,
        message: "Post created successfully",
        data: newPost,
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

  @Query(_return => DataMutationResponse)
  async posts(): Promise<DataMutationResponse> {
    try {
      const posts = await Post.find()

      return {
        code: 200,
        success: true,
        message: "Find post successfully",
        data: posts,
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

  @Query(_return => DataMutationResponse)
  async post(@Arg('id', _type => ID) id: number): Promise<DataMutationResponse> {
    try {
      const post = await Post.findOne({id})

      return {
        code: 200,
        success: true,
        message: "Find post successfully",
        data: post,
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

  @Mutation(_return => DataMutationResponse)
  async updatePost(@Arg('updatePostInput') {title, text}: UpdatePostInput): Promise<DataMutationResponse>{
    try {
      const newPost = Post.create({title, text})      
      await newPost.save()

      return {
        code: 200,
        success: true,
        message: "Post created successfully",
        data: newPost,
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
}

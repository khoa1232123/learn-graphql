import { checkAuth } from "../middlewares/checkAuth";
import { Arg, ID, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Post } from "../entities/Post";
import { DataMutationResponse } from "../types/DataMutationResponse";
import { CreatePostInput, UpdatePostInput } from "../types/PostInput";
// import { PostMutationResponse } from "../types/PostMutationResponse";

@Resolver()
export class PostResolver {
  @Mutation((_return) => DataMutationResponse)
  async createPost(
    @Arg("createPostInput") { title, text }: CreatePostInput
  ): Promise<DataMutationResponse> {
    try {
      const newPost = Post.create({ title, text });
      await newPost.save();

      return {
        code: 200,
        success: true,
        message: "Post created successfully",
        post: newPost,
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

  @Query((_return) => DataMutationResponse)
  @UseMiddleware(checkAuth)
  async posts(): Promise<DataMutationResponse> {
    try {
      const posts = await Post.find();

      return {
        code: 200,
        success: true,
        message: "Find post successfully",
        posts: posts
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

  @Query((_return) => DataMutationResponse)
  async post(
    @Arg("id", (_type) => ID) id: number,
  ): Promise<DataMutationResponse> {
    
    try {
      const existingPost = await Post.findOne({ id });

      if (!existingPost) {
        return {
          code: 400,
          success: false,
          message: `Post not found`,
        };
      }

      return {
        code: 200,
        success: true,
        message: "Find post successfully",
        post: existingPost,
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
  async updatePost(
    @Arg("updatePostInput") { id, title, text }: UpdatePostInput
  ): Promise<DataMutationResponse> {
    try {
      const existingPost = await Post.findOne({ id });
      if (!existingPost) {
        return {
          code: 400,
          success: false,
          message: `Post not found`,
        };
      }

      existingPost.title = title;
      existingPost.text = text;

      await existingPost.save();

      return {
        code: 200,
        success: true,
        message: "Post created successfully",
        post: existingPost,
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
  async deletePost(
    @Arg("id", (_type) => ID) id: number
  ): Promise<DataMutationResponse> {
    try {
      const existingPost = await Post.findOne({ id });
      if (!existingPost) {
        return {
          code: 400,
          success: false,
          message: `Post not found`,
        };
      }

      await Post.delete({ id });

      return {
        code: 200,
        success: true,
        message: "Post deleted successfully",
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

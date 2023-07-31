import {
  Arg,
  Ctx,
  FieldResolver,
  ID,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Post } from "../entities/Post";
import { DataMutationResponse } from "../types/DataMutationResponse";
import { CreatePostInput, UpdatePostInput } from "../types/PostInput";
import { User } from "../entities/User";
import { FindManyOptions, LessThan } from "typeorm";
import { Context } from "../types/Context";

@Resolver((_of) => Post)
export class PostResolver {
  @FieldResolver((_return) => String)
  textSnippet(@Root() root: Post): String {
    return root.text.slice(0, 50);
  }

  @FieldResolver((_return) => User)
  async user(@Root() root: Post) {
    return await User.findOne(root.userId);
  }

  @Mutation((_return) => DataMutationResponse)
  async createPost(
    @Arg("createPostInput") { title, text }: CreatePostInput,
    @Ctx() { req }: Context
  ): Promise<DataMutationResponse> {
    try {
      const newPost = Post.create({ title, text, userId: req.session.userId });
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

  @Query((_return) => DataMutationResponse, { nullable: true })
  async posts(
    @Arg("limit", (_type) => Int, { nullable: true }) limit: number = 5,
    @Arg("cursor", { nullable: true }) cursor?: Date
  ): Promise<DataMutationResponse | null> {
    try {
      const realLimit = Math.min(10, limit);

      const findOptions: FindManyOptions<Post> = {
        order: { createdAt: "DESC" },
        take: realLimit,
      };

      let lastPost: Post[] = [];
      if (cursor) {
        findOptions.where = {
          createdAt: LessThan(cursor),
        };

        lastPost = await Post.find({ order: { createdAt: "ASC" }, take: 1 });
      }

      const posts = await Post.find(findOptions);

      const totalCount = await Post.count();

      return {
        code: 200,
        success: true,
        message: "Find post successfully",
        paginatedPosts: {
          totalCount: totalCount,
          cursor: posts[posts.length - 1].createdAt,
          hasMore: cursor
            ? posts[posts.length - 1].createdAt.toString() !==
              lastPost[0].createdAt.toString()
            : posts.length !== totalCount,
          posts,
        },
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
    @Arg("updatePostInput") { id, title, text }: UpdatePostInput,
    @Ctx() { req }: Context
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

      if(existingPost.userId !== req.session.userId){
        return {
          code: 401,
          success: false,
          message: `Unauthorized`,
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
    @Arg("id", (_type) => ID) id: number,
    @Ctx() { req }: Context
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

      if(existingPost.userId !== req.session.userId){
        return {
          code: 401,
          success: false,
          message: `Unauthorized`,
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

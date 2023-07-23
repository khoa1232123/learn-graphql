import dotenv from "dotenv";
import "reflect-metadata";
import express from "express";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import {} from "apollo-server-express";
import { UserResolver } from "./resolvers/user";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import { COOKIE_NAME } from "./constants";
import { Context } from "./types/Context";
import { PostResolver } from "./resolvers/post";
import cors from "cors";

dotenv.config();

const main = async () => {
  await createConnection({
    type: "postgres",
    database: "learn-graphql",
    username: process.env.DB_USERNAME_DEV,
    password: process.env.DB_PASSWORD_DEV,
    logging: true,
    synchronize: true,
    entities: [User, Post],
  });

  const app = express();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );

  // Session/Cookie store
  const mongoUrl = process.env.MONGODB_CONNECT || "";
  await mongoose.connect(mongoUrl);
  console.log("mongo db connected");

  app.use(
    session({
      name: COOKIE_NAME,
      store: MongoStore.create({ mongoUrl }),
      cookie: {
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
      secret: COOKIE_NAME,
      saveUninitialized: false,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver, PostResolver],
      validate: false,
    }),
    context: ({ req, res }): Context => ({ req, res }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () =>
    console.log(
      `server run at: http://localhost:${PORT}${apolloServer.graphqlPath}`
    )
  );
};

main();

import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import { buildDataLoaders } from "src/utils/dataLoaders";
import { Connection } from "typeorm";

export type Context = {
  req: Request & {
    session: { userId?: number } & Session & Partial<SessionData>;
  };
  res: Response;
  connection: Connection;
  dataLoaders: ReturnType<typeof buildDataLoaders>;
};

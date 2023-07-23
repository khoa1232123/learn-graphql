import { Request, Response } from "express";
import { Session, SessionData } from "express-session";

export type Context = {
  req: Request & {
    session: { userId?: number } & Session & Partial<SessionData>;
  };
  res: Response;
};

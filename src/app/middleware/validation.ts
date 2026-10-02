import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validation = (validationSchema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await validationSchema.parseAsync({
        body: req.body,
        cookie: {
          refreshToken: req.cookies?.refreshToken,
        },
      });
      next();
    } catch (err) {
      next(err);
    }
  };
};

import { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";
import getMongoClient from "./mongo";

export function validateBody(
  body: Record<string, unknown> | undefined,
  requiredParams: string[],
  optionalParams: string[]
): { error: string; invalid: string } | true {
  for (const param of requiredParams) {
    if (!body || !body[param]) {
      return { error: `${param} is missing in body`, invalid: param };
    }
  }
  for (const element of Object.keys(body)) {
    if (
      !requiredParams.includes(element) &&
      !optionalParams.includes(element)
    ) {
      return { error: `${element} is not allowed in body`, invalid: element };
    }
  }
  return true;
}

type AuthAdditions = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  none: {};
  jwt: {
    userJwt: string;
    username: string;
  };
  adminJwt: {
    userJwt: string;
    username: string;
  };
};

export function validateMiddleware<
  AuthType extends keyof AuthAdditions = "none"
>(
  method: string | string[],
  requiredParams: string[],
  optionalParams: string[],
  auth: AuthType,
  callback: (
    req: VercelRequest & AuthAdditions[AuthType] & { mongoClient: MongoClient },
    res: VercelResponse
  ) => unknown
): (req: VercelRequest, res: VercelResponse) => Promise<unknown> {
  return async (req: VercelRequest, res: VercelResponse) => {
    if (typeof method === "string") method = [method];
    if (!method.includes(req.method))
      return res.status(400).json({ error: "Bad method", allowed: method });
    const validationResult = validateBody(
      req.method === "GET" ? req.query : req.body,
      requiredParams,
      optionalParams
    );
    if (validationResult !== true)
      return res.status(400).json(validationResult);

    if (auth === "jwt" || auth === "adminJwt") {
      if (!req.headers.authorization)
        return res
          .status(400)
          .json({ error: "No Authorization header provided" });
      const authKey = req.headers.authorization.split(" ")[1];
      if (!authKey)
        return res
          .status(400)
          .json({ error: "Authorization header badly formatted" });
      try {
        const data = jwt.verify(authKey, process.env.JWT_SECRET, {
          maxAge: "1y",
        });
        if(auth === "adminJwt" && (data as { role?: string }).role !== "admin")
          return res.status(403).json("Permission denied!");
        (req as VercelRequest & Partial<AuthAdditions["jwt"]>).userJwt =
          req.headers.authorization.split(" ")[1];
        (req as VercelRequest & Partial<AuthAdditions["jwt"]>).username = (
          data as jwt.JwtPayload
        ).username;
      } catch {
        return res.status(401).json({ error: "Invalid JWT" });
      }
    }
    try {
      (req as VercelRequest & { mongoClient: MongoClient }).mongoClient =
        await getMongoClient();
      await callback(
        req as VercelRequest &
          AuthAdditions[AuthType] & { mongoClient: MongoClient },
        res
      );
    } catch (error: unknown) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

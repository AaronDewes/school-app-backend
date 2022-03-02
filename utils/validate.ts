import { VercelRequest, VercelResponse } from "@vercel/node";

export function validateBody(
  body: Record<string, unknown> | undefined,
  requiredParams: string[]
): string | true {
  for (const param of requiredParams) {
    if (!body || !body[param]) {
      return param;
    }
  }
  return true;
}

export function validateMiddleware(
  method: string | string[],
  requiredParams: string[],
  auth: "jwt" | false,
  callback: (req: VercelRequest, res: VercelResponse) => unknown
): (req: VercelRequest, res: VercelResponse) => Promise<unknown> {
  return async (req: VercelRequest, res: VercelResponse) => {
    if (typeof method === "string") method = [method];
    if (!method.includes(req.method))
      return res.status(400).json({ error: "Bad method", allowed: method });
    const validationResult = validateBody(req.body, requiredParams);
    if (validationResult !== true) {
      res
        .status(400)
        .json({ error: "Missing body parameter", missing: validationResult });
    } else {
      await callback(req, res);
    }
  };
}

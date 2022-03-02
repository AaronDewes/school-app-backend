import jwt from "jsonwebtoken";
import { validateMiddleware } from "../utils/validate";

const handler = validateMiddleware(
  "GET",
  [],
  "jwt",
  async (req, res) => {
    res.json(jwt.verify(req.headers.authorization, "NotVerySecretYet"));
  }
);

export default handler;

import jwt from "jsonwebtoken";
import { validateMiddleware } from "../utils/validate";

const handler = validateMiddleware(
  "GET",
  [],
  "jwt",
  async (req, res) => {
    if(!req.headers.authorization)
      return res.status(400).json({error: "No Authorization header provided"});
    const authKey = req.headers.authorization.split(' ')[1];
    if(!authKey)
      return res.status(400).json({error: "Authorization header badly formatted"});
    res.json(jwt.verify(req.headers.authorization, process.env.JWT_SECRET));
  }
);

export default handler;

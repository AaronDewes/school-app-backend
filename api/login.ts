import jwt from "jsonwebtoken";
import clientQuery from "../utils/mongo";
import { isValidLogin, userExists } from "../utils/user";
import { validateMiddleware } from "../utils/validate";

const handler = validateMiddleware(
  "POST",
  ["username", "password"],
  false,
  async (req, res) => {
    await clientQuery(async (client) => {
      if (!(await userExists(req.body.username, client)))
        return res.status(401).json({ error: "No user with this name exists" });
      if (!(await isValidLogin(req.body.username, req.body.password, client)))
        return res.status(401).json({ error: "Invalid password." });
      res.json({
        jwt: jwt.sign({ username: req.body.username }, process.env.JWT_SECRET),
      });
    });
  }
);

export default handler;

import jwt from "jsonwebtoken";
import { isValidLogin, userExists } from "../utils/user";
import { validateMiddleware } from "../utils/validate";

export default validateMiddleware(
  "POST", // method
  ["username", "password"], // Required parameters in body
  [], // Optional allowed body parameters
  "none", // Requires auth
  async (req, res) => {
    if (!(await userExists(req.body.username, req.mongoClient)))
      return res.status(401).json({ error: "No user with this name exists" });
    if (
      !(await isValidLogin(
        req.body.username,
        req.body.password,
        req.mongoClient
      ))
    )
      return res.status(401).json({ error: "Invalid password." });
    res.json({
      jwt: jwt.sign({ username: req.body.username }, process.env.JWT_SECRET),
    });
  }
);

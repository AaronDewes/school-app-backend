import jwt from "jsonwebtoken";
import { isValidLogin } from "../utils/user";
import { validateMiddleware } from "../utils/validate";

export default validateMiddleware(
  "POST", // method
  ["username", "password"], // Required parameters in body
  [], // Optional allowed body parameters
  "none", // Requires auth
  async (req, res) => {
    const isValid = await isValidLogin(
      req.body.username,
      req.body.password,
      req.mongoClient
    );
    if (isValid === null)
      return res.status(401).json({ error: "No user with this name exists" });
    else if (!isValid)
      return res.status(401).json({ error: "Invalid password." });
    res.json({
      jwt: jwt.sign(
        { username: req.body.username, role: isValid.role || "student" },
        process.env.JWT_SECRET
      ),
    });
  }
);

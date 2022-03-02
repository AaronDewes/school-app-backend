import { VercelRequest, VercelResponse } from "@vercel/node";
import clientQuery from "../utils/mongo";
import { personalData, userDocument } from "../types";
import { hashSync } from "@node-rs/bcrypt";
import { validateMiddleware } from "../utils/validate";
import { userExists } from "../utils/user";

const BCRYPT_ROUNDS = 15;

const handler = validateMiddleware(
  "POST",
  ["username", "firstName", "lastName", "password", "email"],
  false,
  async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST")
      return res.status(400).json({ error: "Method not supported" });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    await clientQuery(async (client) => {
      let db = client.db("users");
      let credentialsCollection = db.collection<userDocument>("credentials");
      let userDataCollection = db.collection<personalData>("data");
      let existingUsers = await credentialsCollection.findOne({
        username: req.body.username,
      });
      if (userExists(req.body.username, client)) {
        res.status(400).json({ error: "User already exists" });
        return;
      }
      await credentialsCollection.insertOne({
        hashedPassword: hashSync(req.body.password, BCRYPT_ROUNDS),
        username: req.body.username,
        email: req.body.email,
        role: "student",
      });
      await userDataCollection.insertOne({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      });
      res.json({ success: true });
    });
  }
);

export default handler;

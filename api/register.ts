import { personalData, userDocument } from "../types";
import { hashSync } from "@node-rs/bcrypt";
import { validateMiddleware } from "../utils/validate";
import { userExists } from "../utils/user";

const BCRYPT_ROUNDS = 15;

export default validateMiddleware(
  "POST", // method
  ["username", "firstName", "lastName", "password", "email"], // Required parameters in body
  [], // Optional allowed body parameters
  "none", // Requires auth
  async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const db = req.mongoClient.db("users");
    const credentialsCollection = db.collection<userDocument>("credentials");
    const userDataCollection = db.collection<personalData>("userData");
    if (await userExists(req.body.username, req.mongoClient)) {
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
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });
    res.json({ success: true });
  }
);

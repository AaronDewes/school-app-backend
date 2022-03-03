import { personalData, userDocument } from "../types";
import { validateMiddleware } from "../utils/validate";

export default validateMiddleware(
  "POST", // method
  [], // Required parameters in query
  [], // Optional allowed query parameters
  "jwt", // Requires auth
  async (req, res) => {
    await req.mongoClient
      .db("users")
      .collection<userDocument>("credentials")
      .createIndex({ username: 1 });
    await req.mongoClient
      .db("users")
      .collection<personalData>("userData")
      .createIndex({ username: 1 });
    res.json({success: true});
  }
);

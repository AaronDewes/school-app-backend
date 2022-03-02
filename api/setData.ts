import { setData } from "../utils/user";
import { validateMiddleware } from "../utils/validate";

export default validateMiddleware(
  "POST", // method
  [], // Required parameters in query
  ["subjects", "class", "firstName", "lastName", "profilePicture"], // Optional allowed query parameters
  "jwt", // Requires auth
  async (req, res) => {
    await setData(req.username, req.body, req.mongoClient);
    res.json({ success: true });
  }
);

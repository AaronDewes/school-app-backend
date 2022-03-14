import { Lesson } from "../types";
import { validateMiddleware } from "../utils/validate";

export default validateMiddleware(
  "POST", // method
  ["class", "timetableData"], // Required parameters in body
  [], // Optional allowed body parameters
  "adminJwt", // Requires auth
  async (req, res) => {
    if (!Array.isArray(req.body.timetableData) || !Array.isArray(req.body.timetableData[0])) return res.status(400);
    const collection = req.mongoClient.db("timetables").collection<{
      date: number;
      data: Lesson[][];
    }>(req.body.class);
    await collection.insertOne({
      date: Date.now(),
      data: req.body.timetableData,
    });
    res.json("Done!")
  }
);

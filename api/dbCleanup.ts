import { FindCursor, WithId } from "mongodb";
import { Lesson, personalData, userDocument } from "../types";
import { validateMiddleware } from "../utils/validate";

export default validateMiddleware(
  "POST", // method
  [], // Required parameters in query
  [], // Optional allowed query parameters
  "adminJwt", // Requires auth
  async (req, res) => {
    await req.mongoClient
      .db("users")
      .collection<userDocument>("credentials")
      .createIndex({ username: 1 });
    await req.mongoClient
      .db("users")
      .collection<personalData>("userData")
      .createIndex({ username: 1 });
    try{
      await req.mongoClient.db("caches").collection("timetables").drop();
    } catch {
      console.log("Couldn't drop");
    }
      const collections = await req.mongoClient.db("timetables").collections();
    const teachers: Record<string, Record<number, Record<number, {
      class: string;
      room: string;
      subject: string;
    }>>> = {};
    for(const collection of collections) {
      const name = collection.collectionName;
      const findCursor = await collection.find().sort({date:-1}).limit(1) as FindCursor<WithId<{
        date: number;
        data: Lesson[][];
        }>>;
      const actualData = (await findCursor.toArray())[0];
      await req.mongoClient.db("caches").collection("timetables").insertOne({
        class: name,
        data: actualData.data,
      });
      for(const [dayNumber, day] of actualData.data.entries()) {
        for(const [index, lesson] of day.entries()) {
          if(!teachers[lesson.teacher]) {
            teachers[lesson.teacher] = {};
          }
          if(!teachers[lesson.teacher][dayNumber]) {
            teachers[lesson.teacher][dayNumber] = {};
          }
          teachers[lesson.teacher][dayNumber][index] = {
            class: name,
            room: lesson.room,
            subject: lesson.subject,
          };
        }
      }
    }
    for(const teacherName of Object.keys(teachers)) {
      await req.mongoClient.db("caches").collection("timetables").insertOne({
        teacher: teacherName,
        data: teachers[teacherName],
      });
    }
    res.json({success: true});
  }
);

import { MongoClient, WithId } from "mongodb";
import { personalData, userDocument } from "../types";
import { verify } from "@node-rs/bcrypt";

export async function userExists(
  username: string,
  client: MongoClient
): Promise<boolean> {
  const existingUser = await client
    .db("users")
    .collection<userDocument>("credentials")
    .findOne({ username });
  return !!existingUser;
}

export async function isValidLogin(
  username: string,
  password: string,
  client: MongoClient
): Promise<WithId<userDocument> | false | null> {
  const user = await client
    .db("users")
    .collection<userDocument>("credentials")
    .findOne({ username });
  if (!user) return null;
  const isValid = await verify(password, user.hashedPassword);
  return isValid ? user : false;
}

export async function setData(
  username: string,
  data: Partial<personalData>,
  client: MongoClient
) {
  const dataCollection = client
    .db("users")
    .collection<personalData>("userData");
  await dataCollection.findOneAndUpdate({ username }, { $set: data });
}

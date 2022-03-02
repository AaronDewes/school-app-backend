import { MongoClient } from "mongodb";
import { userDocument } from "../types";
import { verify } from "@node-rs/bcrypt";

export async function userExists(
  username: string,
  client: MongoClient
): Promise<boolean> {
  return !!(await client
    .db("users")
    .collection<userDocument>("credentials")
    .findOne({ username }));
}

export async function isValidLogin(
  username: string,
  password: string,
  client: MongoClient
): Promise<boolean> {
  const user = await client
    .db("users")
    .collection<userDocument>("credentials")
    .findOne({ username });
  if (!user) return false;
  return await verify(password, user.hashedPassword);
}

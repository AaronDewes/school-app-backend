import { VercelRequest, VercelResponse } from '@vercel/node';
import clientQuery from '../mongo';
import { userDocument } from '../types';
import {hashSync} from "@node-rs/bcrypt";

const BCRYPT_ROUNDS = 15;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if(req.method !== "POST")
        return res.status(400).json({error: "Method not supported"});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    const data = await clientQuery(async (client) => {
        let db = client.db("users");
        let collection = db.collection("credentials");
        if(!req.body.username || !req.body.password) {
            res.status(400).json({"error": `${req.body.username ? "password" : "username"} is missing`});
            return;
        }
        let existingUsers = await collection.findOne<userDocument>({
            username: req.body.username
        });
        if(existingUsers) {
            res.status(400).json({error: "User already exists"});
            return;
        }
        await collection.insertOne({
            firstName: "Aaron",
            lastName: "Dewes",
            hashedPassword: hashSync(req.body.password, BCRYPT_ROUNDS),
            username: req.body.username,
        });
        return await collection.findOne<userDocument>({
            username: req.body.username
        });
    });
    res.json(data);
}
import { MongoClient, ServerApiVersion } from "mongodb";
const credentials = "/workspace/school-app-backend/mongo.pem";
let cachedClient = null;

export default async function getMongoClient(): Promise<MongoClient> {
  if (!cachedClient) {
    cachedClient = new MongoClient(
      "mongodb+srv://cluster0.zegm9.mongodb.net/myFirstDatabase?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority",
      {
        sslKey: credentials,
        sslCert: credentials,
        serverApi: ServerApiVersion.v1,
      }
    );
    await cachedClient.connect();
  }
  return cachedClient;
}

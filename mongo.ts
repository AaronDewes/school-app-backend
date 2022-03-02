import { MongoClient, ServerApiVersion } from 'mongodb';
const credentials = '/workspace/school-app-backend/mongo.pem';
const client = new MongoClient('mongodb+srv://cluster0.zegm9.mongodb.net/myFirstDatabase?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority', {
  sslKey: credentials,
  sslCert: credentials,
  serverApi: ServerApiVersion.v1
});
async function run() {
  try {
    await client.connect();
    const database = client.db("testDB");
    const collection = database.collection("testCol");
    const docCount = await collection.countDocuments({});
    console.log(docCount);
    // perform actions using client
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
//run().catch(console.dir);

async function clientQuery<ReturnType = unknown>(func: (client: MongoClient) => ReturnType | Promise<ReturnType>): Promise<ReturnType> {
  let data;
  try {
    await client.connect();
    data = await func(client);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
  return data;
}
export default clientQuery;
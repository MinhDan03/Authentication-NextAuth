import { MongoClient } from "mongodb";
export async function connectToDatabase() {
  const client = await MongoClient.connect(
    "mongodb+srv://dan11102003net:dD09P0RSbcmCA1Ft@cluster0.qq3r4.mongodb.net/auth?retryWrites=true&w=majority&appName=Cluster0"
  );
  return client;
}

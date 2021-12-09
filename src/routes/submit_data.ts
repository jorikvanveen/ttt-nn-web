import type { ServerRequest } from "@sveltejs/kit/types/hooks"
import * as dotenv from "dotenv"
import { MongoClient } from "mongodb"
dotenv.config()

const MONGO_URI: string = process.env.MONGO_URI

if (!MONGO_URI) {
    console.error("NO MONGO_URI SPECIFIED, please set the MONGO_URI environment variable")
    process.exit()
}

console.log(MONGO_URI)

const client_obj = new MongoClient(MONGO_URI)

let connected = false
const conn_prom = client_obj.connect()
    .then(() => connected = true)
    .catch((err) => {
        console.error("Failed to connectt to db")
        console.error(err)
        process.exit()
    })

export async function post(request: ServerRequest) {
    const data = JSON.parse(request.body as string) as {
        timestamp: Date;
        first_move_was_human: boolean;
        winner: string;
        moves: number[];
    }

    // Verify data
    const datakeys = Object.keys(data)
    if (
        datakeys.length != 4 ||
        !datakeys.includes("timestamp") ||
        !datakeys.includes("first_move_player") ||
        !datakeys.includes("winner") ||
        !datakeys.includes("moves")
    ) return {
        status: 400
    }
    
    if (!connected) await conn_prom

    const db = client_obj.db("brainlet");
    let insertedId = null

    try {
        insertedId = (await db.collection("ttt_games").insertOne(data)).insertedId
    } catch {
        return {
            status: 500,
            body: {
                error: "Write to db failed"
            }
        }
    }

    return {
        status: 200,
        body: {
            insertedId
        }
    }
}
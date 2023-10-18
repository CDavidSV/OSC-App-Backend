import app from "./server";
import https from "https";
import connectMongoDB from "./config/db";
import fs from "fs";

// Server port
const port = 80;
// Server api url
const apiUrl = "https://localhost"
// Mongo URI
const MONGO_URI = process.env.MONGO_URI_ATLAS as string;
// const MONGO_URI = process.env.MONGO_URI_ITESM as string;

// Main server function
const main = async () => {
    await connectMongoDB(MONGO_URI);

    https.createServer({
        cert: fs.readFileSync(process.env.CERT as string, 'utf8'),
        key: fs.readFileSync(process.env.CERT_KEY as string, 'utf8'),
        passphrase: process.env.CERT_PASSPHRASE as string
    }, app).listen(port, () => {
        console.log(`Server listening at ${apiUrl}:${port}`.green);
    });

    // app.listen(port, () => {
    //     console.log(`Server listening at ${apiUrl}:${port}`.green);
    // });
};

main();
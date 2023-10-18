import dotenv from "dotenv";
dotenv.config();
import express from "express";
import colors from "colors";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import rateLimiter from "./middlewares/rate-limiter";

// routes
import routes from "./routes/router";

// Config
colors.enable();
const app = express();
const logger = morgan('dev');

// Middleware
app.use(logger);
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
);
app.use(rateLimiter);
app.use(cors());

// Register routes
app.use(routes);

export default app;
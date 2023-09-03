import dotenv from "dotenv";
dotenv.config();
import express from "express";
import colors from "colors";
import morgan from "morgan";
import bodyParser from "body-parser";
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
  
// Register routes
app.use(routes);

export default app;
import express from "express";
import colors from "colors";
import morgan from "morgan";
import dotenv from "dotenv";

// routes
import routes from "./routes/router";

// Config
dotenv.config();
colors.enable();
const app = express();
const logger = morgan('dev');

// Middleware
app.use(logger);

// Register routes
app.use(routes);

export default app;
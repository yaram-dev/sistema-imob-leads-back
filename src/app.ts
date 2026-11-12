import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://imobiliaria-leads-front.vercel.app",
  "https://jackmaiaimoveis.com.br",
  "http://localhost:3000",
  "http://localhost:3002",
].filter((origin) => Boolean(origin));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origem não permitida pelo CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

app.use(routes);

app.use(errorHandler);

export default app;

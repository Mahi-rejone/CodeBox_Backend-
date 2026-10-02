import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cookieParser from  "cookie-parser";
import cors from "cors";
import { config } from "./app/config/config.js";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/routeNotFound";
import router from "./app/routes/index.js";
export const app: Application = express();

app.use(express.json());
app.use(cors({ origin: config.origin as string, credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", router);
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Codebox Server.");
});
app.use(globalErrorHandler);
app.use(notFound);

import express, { Request, Response } from "express";
import logger from "morgan";

const app = express();
const port = 8080;

app.use(logger("dev"));
app.get("/", (req: Request, res: Response) => res.send("Simple Node Service"));

app.listen(port, () =>
  console.log(`Simple Node Service listening at port ${port}`)
);
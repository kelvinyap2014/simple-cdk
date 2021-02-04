import express, { Request, Response } from "express";
import logger from "morgan";
import AWS from "aws-sdk";

const port = process.env.NODE_PORT;
const queueHost = process.env.NODE_QUEUE_HOST;
const queueUrl = process.env.NODE_QUEUE_URL;
const accessKeyId = process.env.NODE_ACCESS_KEY_ID;
const secretAccessKey = process.env.NODE_SECRET_ACCESS_KEY;
const region = process.env.NODE_REGION;

const app = express();
app.use(logger(process.env.NODE_LOGGER || "dev"));

app.get("/", (req: Request, res: Response) => res.send("Simple Node Service"));

app.get("/sqs", (req: Request, res: Response) => {
  console.log(`Sending message to SQS at ${queueHost}`);
  const now = new Date().toISOString();
  const message = `Hello SQS at ${now}`;
  // Create an SQS service object on the elasticmq endpoint
  const config = {
    endpoint: new AWS.Endpoint(queueHost),
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region,
  }
  const sqs = new AWS.SQS(config);

  const params = {
    MessageAttributes: {
      "Title": {
        DataType: "String",
        StringValue: message
      },
      "Author": {
        DataType: "String",
        StringValue: "GitHub"
      }
    },
    MessageBody: JSON.stringify({"Message": message, "File": now}),
    QueueUrl: queueUrl
  };
 
  sqs.sendMessage(params, function(err, data) {
    if (err) {
      console.log("Error", err);
      res.send(`Error sending this message to SQS - [${message}]`);
    } else {
      console.log("Success", data.MessageId);
      res.send(`Success sending this message to SQS - [${message}]. Browse {s3_host}/${now}`);
    }
  });
});

app.listen(port, () =>
  console.log(`Simple Node Service listening at port ${port}`)
);
import express, { Request, Response } from "express";
import logger from "morgan";
import AWS from "aws-sdk";

const port = process.env.NODE_PORT;
const queueHost = process.env.NODE_QUEUE_HOST || "";
const queueUrl = process.env.NODE_QUEUE_URL || "";
const accessKeyId = process.env.NODE_ACCESS_KEY_ID;
const secretAccessKey = process.env.NODE_SECRET_ACCESS_KEY;
const region = process.env.NODE_REGION;

const config = {
  endpoint: new AWS.Endpoint(queueHost),
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region,
}

const app = express();
app.use(logger(process.env.NODE_LOGGER || "dev"));

app.get("/", (req: Request, res: Response) => res.send("Simple Node Service"));

app.get("/dynamodb", (req: Request, res: Response) => {
  queryMessageTableDynamoDB();
  res.send("DynamoDB query success");
});

app.get("/sqs", (req: Request, res: Response) => {
  console.log(`Sending message to SQS at ${queueHost}`);
  const now = new Date().toISOString();
  const message = `Hello SQS at ${now}`;
  const file = now.split(":").join("") + ".txt";
  // Create an SQS service object on the elasticmq endpoint
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
    MessageBody: JSON.stringify({"Message": message, "File": file}),
    QueueUrl: queueUrl
  };
 
  sqs.sendMessage(params, function(err, data) {
    if (err) {
      console.log("Error SQS sendMessage()", err);
      res.send(`Error sending this message to SQS - [${message}]`);
    } else {
      console.log("Success SQS sendMessage()", data.MessageId);
      insertMessageTableDynamoDB(data.MessageId || "", message, file);
      res.send(`Success sending this message to SQS - [${message}]. Browse s3://simplecdkstack-simplebucket/${file}`);
    }
  });
});

const insertMessageTableDynamoDB = (messageId: string, message: string, file: string): void => {
  console.log(`insertMessageTableDynamoDB ${file}`);

  // Create the DynamoDB service object
  const ddb = new AWS.DynamoDB(config);

  const params = {
    TableName: 'SIMPLE_MESSAGE',
    Item: {
      'ID' : {S: messageId},
      'CONTENT' : {S: message},
      'FILE' : {S: file}
    }
  };

  // Call DynamoDB to add the item to the table
  ddb.putItem(params, function(err, data) {
    if (err) {
      if (err.code === "ResourceNotFoundException") {
        createInsertMessageTableDynamoDB(messageId, message, file);
      } else {
        console.log("Error DynamoDB putItem()", err);
      }
    } else {
      console.log("Success DynamoDB putItem()", data);
    }
  });
}

const createInsertMessageTableDynamoDB = (messageId: string, message: string, file: string): void => {
  console.log(`createInsertMessageTableDynamoDB`);
  // Create the DynamoDB service object
  const ddb = new AWS.DynamoDB(config);

  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'ID',
        AttributeType: 'S'
      }
    ],
    KeySchema: [
      {
        AttributeName: 'ID',
        KeyType: 'HASH'
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    },
    TableName: 'SIMPLE_MESSAGE',
    StreamSpecification: {
      StreamEnabled: false
    }
  };

  // Call DynamoDB to create the table
  ddb.createTable(params, function(err, data) {
    if (err) {
      console.log("Error DynamoDB createTable()", err);
    } else {
      console.log("Table Created DynamoDB createTable()", data);
      insertMessageTableDynamoDB(messageId, message, file);
    }
  });
}

const queryMessageTableDynamoDB = (): void => {
  console.log(`queryMessageTableDynamoDB`);
  // Create the DynamoDB service object
  const ddb = new AWS.DynamoDB(config);
  const params = {
    TableName: "SIMPLE_MESSAGE",
    ExclusiveStartKey: undefined
  };

  const onScan = (err: Error, data: any): void => {
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {        
        console.log("Scan succeeded.");
        let count = 0;
        data.Items.forEach((itemdata: any) => {
           console.log("Item : ", ++count,JSON.stringify(itemdata));
        });

        // continue scanning if we have more items
        if (typeof data.LastEvaluatedKey != "undefined") {
            console.log("Scanning for more...");
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            ddb.scan(params, onScan);
        }
    }
  }

  ddb.scan(params, onScan);
}

app.listen(port, () =>
  console.log(`Simple Node Service listening at port ${port}`)
);
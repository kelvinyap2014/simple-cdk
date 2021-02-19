import express, { Request, Response } from "express";
import logger from "morgan";
import AWS from "aws-sdk";

const port = process.env.NODE_PORT;
const awsHost = process.env.NODE_AWS_HOST || "";
const queueName = process.env.NODE_QUEUE_NAME || "";
const accessKeyId = process.env.NODE_ACCESS_KEY_ID;
const secretAccessKey = process.env.NODE_SECRET_ACCESS_KEY;
const region = process.env.NODE_REGION;
const isDev = process.env.NODE_DEV === "true";
let tableName: string;
let queueUrl: string;

const config = {
  endpoint: new AWS.Endpoint(awsHost),
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region,
}

const app = express();
app.use(logger(process.env.NODE_LOGGER || "dev"));

app.get("/", (req: Request, res: Response) => res.send("Simple Node Service"));

app.get("/dynamodb", (req: Request, res: Response) => {
  querySimpleTableDynamoDB();
  res.send("DynamoDB query completed, please check server logs for details");
});

app.get("/sqs", (req: Request, res: Response) => {
  console.log(`Sending message to SQS at ${awsHost}`);
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
      insertMessageToSimpleTableDynamoDB(data.MessageId || "", message, file);
      res.send(`Success sending this message to SQS - [${message}]. Browse s3://simplecdkstack-simplebucket/${file}`);
    }
  });
});

const insertMessageToSimpleTableDynamoDB = (messageId: string, message: string, file: string): void => {
  console.log(`insertMessageToSimpleTableDynamoDB ${file}`);

  const ddb = getDynamoDB();

  const params = {
    TableName: tableName,
    Item: {
      'id' : {S: messageId},
      'content' : {S: message},
      'file' : {S: file}
    }
  };

  // Call DynamoDB to add the item to the table
  ddb.putItem(params, function(err, data) {
    if (err) {
      if (err.code === "ResourceNotFoundException") {
        createSimpleTableDynamoDB();
        const simpleTablePromise = new Promise((resolve, reject) => {
          setTimeout(() => resolve("Waited 5 seconds"), 5000);
        });
        simpleTablePromise.then((successMessage) => {
          console.log(`${successMessage} for DynamoDB Table being created - ${tableName}`)
          insertMessageToSimpleTableDynamoDB(messageId, message, file);
        });
      } else {
        console.log("Error DynamoDB putItem()", err);
      }
    } else {
      console.log("Success DynamoDB putItem()", data);
    }
  });
}

const createSimpleTableDynamoDB = (): void => {
  console.log(`createSimpleTableDynamoDB`);
  const ddb = getDynamoDB();

  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'id',
        AttributeType: 'S'
      }
    ],
    KeySchema: [
      {
        AttributeName: 'id',
        KeyType: 'HASH'
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    },
    TableName: tableName,
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
    }
  });

  console.log(`Waiting DynamoDB Table being created - ${tableName}`);
}

const querySimpleTableDynamoDB = (): void => {
  console.log(`querySimpleTableDynamoDB`);
  const ddb = getDynamoDB();

  const params = {
    TableName: tableName,
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

const loadQueueUrl = () => {
  const sqs = new AWS.SQS(config);
  const params = {
    QueueNamePrefix: queueName
  };
  sqs.listQueues(params, (err, data) => {
    if (err) {
      console.log("Error SQS listQueues()", err);
    } else {
      console.log("Success SQS listQueues()", data);
      if(data.QueueUrls) {
        queueUrl = data.QueueUrls[0];
        console.log(`Set queueUrl to ${queueUrl}`);
      }
    }
  });
}

const loadTableName = () => {
  const ddb = getDynamoDB();
  const params = {
    ExclusiveStartTableName: process.env.NODE_TABLE_NAME
  };
  ddb.listTables(params, (err, data) => {
    if (err) {
      console.log("Error DynamoDB listTables()", err);
    } else {
      console.log("Success DynamoDB listTables()", data);
      if(data.TableNames) {
        tableName = data.TableNames[0];
        console.log(`Set tableName to ${tableName}`);
      }
    }
  });
}

const getDynamoDB = (): AWS.DynamoDB => {
  if(isDev) {
    return new AWS.DynamoDB(config);
  } else {
    AWS.config.update({region: region});
    return new AWS.DynamoDB({apiVersion: '2012-08-10'});
  }
}

if(isDev) {
  queueUrl = process.env.NODE_QUEUE_URL || "";
  tableName = process.env.NODE_TABLE_NAME || "";
  console.log(`Set queueUrl to ${queueUrl}`);
  console.log(`Set tableName to ${tableName}`);
} else {
  loadQueueUrl();
  loadTableName();
}

app.listen(port, () =>
  console.log(`Simple Node Service listening at port ${port}`)
);

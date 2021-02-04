# Welcome to the Simple CDK TypeScript project!

This is a Simple project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

The CDK script generates the following components in AWS

 * One ECS cluster
 * One VPC
 * Two Fargate services
 * One S3 bucket
 * One DynamoDB table
 * One SQS service

## Useful commands for Simple CDK

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## Simple Node Service
See ./simple-node-service/*, it is a Node JS app deployed as one of the Fargate services.

### Build commands for Simple Node Service
 * `npm run build`                                              compile typescript to js
 * `npm run watch`                                              watch for changes and compile
 * `docker build --tag local/simple-node-service .`             build a docker image
 * `docker run -p 8888:8080/tcp local/simple-node-service`      run a docker image
 * `docker run -it local/simple-node-service bash`              run into the docker image shell

## Simple Python Service
See ./simple-python-service/*, it is a Python app deployed as one of the Fargate services.

### Build commands for Simple Python Service
 * `docker build --tag local/simple-python-service .` build a docker image
 * `docker run local/simple-python-service`           run a docker image
 * `docker run -it local/simple-python-service bash`  run into the docker image shell

## Local integration testing
See ./test-integration for a Docker Compose file that bring up Simple Node Service, Simple Python Service and local AWS services (via [localstack](https://github.com/localstack/localstack)) such as S3, SQS, DynamoDB.

### Build Simple Node Service in ./simple-node-service
 * `npm run build`  compile typescript to js

### Build commands for local integration testing in ./test-integration
 * `docker-compose build` build all local services
 * `docker-compose up`    run all local services

### Handle local SQS message queues
 * Normal queue - `aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name SimpleQueue`
 * Error queue - `aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name ErrorQueue`
 * List queues - `aws --endpoint-url=http://localhost:4566 sqs list-queues`

### Browse
 * `http://localhost:4566/health`   check the health of localstack services
 * `http://localhost:3333`          web UI for localstack services
 * `http://localhost:7777`          web UI for Simple Node Service
 * `http://localhost:7777/sqs`      send a message to SQS queue `SimpleQueue`


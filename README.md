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

### Build commands for Simple Python Service
 * `docker-compose build` build local services
 * `docker-compose up`    run all services

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
 * `npm run build`                                      compile typescript to js
 * `npm run watch`                                      watch for changes and compile
 * `docker build --tag simple-node-service .`           build a docker image
 * `docker run -p 8080:8080/tcp simple-node-service`    run a docker image
 * `docker run -it simple-node-service bash`            run into the docker image shell

## Simple Python Service
See ./simple-python-service/*, it is a Python app deployed as one of the Fargate services.

### Build commands for Simple Python Service
 * `docker build --tag simple-python-service .` build a docker image
 * `docker run simple-python-service`           run a docker image
 * `docker run -it simple-python-service bash`  run into the docker image shell

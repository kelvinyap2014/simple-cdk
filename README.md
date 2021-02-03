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

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";

export class SimpleCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a S3 Bucket
    new s3.Bucket(this, 'SimpleBucket', {
      versioned: true,
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Create a VPC
    const vpc = new ec2.Vpc(this, "SimpleVpc", {
      maxAzs: 3 // Default is all AZs in region
    });

    // Create a ECS Cluster
    const cluster = new ecs.Cluster(this, "SimpleCluster", {
      vpc: vpc
    });

    // Create a load-balanced Python Fargate service and make it private
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "SimplePythonFargateService", {
      cluster: cluster, // Required
      cpu: 256, // Default is 256
      desiredCount: 1, // Default is 1
      taskImageOptions: { image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample") },
      memoryLimitMiB: 512, // Default is 512
      publicLoadBalancer: false // Default is false
    });

    // Create a load-balanced Node Fargate service and make it public
    // React app with talk to Node Service over public Internet
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "SimpleNodeFargateService", {
      cluster: cluster, // Required
      cpu: 256, // Default is 256
      desiredCount: 1, // Default is 1
      taskImageOptions: { image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample") },
      memoryLimitMiB: 512, // Default is 512
      publicLoadBalancer: true // Default is false
    });



  }
}

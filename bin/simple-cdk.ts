#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SimpleCdkStack } from '../lib/simple-cdk-stack';

const app = new cdk.App();
new SimpleCdkStack(app, 'SimpleCdkStack');

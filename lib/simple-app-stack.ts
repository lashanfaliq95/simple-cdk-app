import { Bucket } from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import { Runtime } from '@aws-cdk/aws-lambda';
import * as path from 'path';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { CorsHttpMethod, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';

export class SimpleAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getTextLambda = new lambda.NodejsFunction(this, 'simpleLambda', {
      runtime: Runtime.NODEJS_14_X,
      entry: path.join(__dirname, '..', 'api', 'index.ts'),
      handler: 'getText'
    });

    const webSiteBucket = new Bucket(this, 'feBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    });

    new BucketDeployment(this, 'websiteDeploy', {
      sources: [Source.asset(path.join(__dirname, '..', 'frontend', 'build'))],
      destinationBucket: webSiteBucket
    });

    const httpApi = new HttpApi(this, 'simpleHttpApi', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.GET]
      },
      apiName: 'getText',
      createDefaultStage: true
    });

    const lambdaIntegration = new LambdaProxyIntegration({
      handler: getTextLambda
    });

    httpApi.addRoutes({
      path: '/getText',
      methods: [HttpMethod.GET],
      integration: lambdaIntegration
    });

    new cdk.CfnOutput(this, 'apiExport', {
      value: httpApi.url!
    });

    new cdk.CfnOutput(this, 'myBucketExport', {
      value: webSiteBucket.bucketWebsiteUrl,
      exportName: 'websiteBucketName'
    });
  }
}

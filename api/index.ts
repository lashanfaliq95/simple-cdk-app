import { APIGatewayProxyEventV2, Context } from 'aws-lambda';

async function getText(event: APIGatewayProxyEventV2, context: Context) {
  return {
    statusCode: 200,
    body: 'Hello from Lambda'
  };
}

export { getText };

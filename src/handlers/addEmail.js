import addEmailSchema from "../lib/schemas/addEmailSchema";
import commonMiddleware from "../lib/commonMiddleware";

import AWS from 'aws-sdk';
import createError from 'http-errors';
import { v4 as uuid } from 'uuid';
import validator from "@middy/validator";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function addEmail(event, context) {
  const { email, companyId } = event.body;

  const user = {
    id: uuid(),
    companyId,
    email,
  };

  try {
    await dynamodb.put({
      TableName: process.env.USER_TABLE_NAME,
      Item: user
    }).promise();
  } catch(error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(user),
  };
}

export const handler = commonMiddleware(addEmail)
    .use(validator({
      inputSchema: addEmailSchema,
    }));



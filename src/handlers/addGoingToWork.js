import commonMiddleware from "../lib/commonMiddleware";

import AWS from 'aws-sdk';
import createError from 'http-errors';
import moment from "moment";
import { v4 as uuid } from 'uuid';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function addGoingToWork(event, context) {
    const { email, companyId, status } = event.queryStringParameters;
    const tomorrow = moment().add(1, 'd');

    const workSubmission = {
        id: uuid(),
        workDate: tomorrow.toISOString(),
        companyId,
        email,
        status,
    };

    try {
        await dynamodb.put({
            TableName: process.env.GOING_TO_WORK_TABLE_NAME,
            Item: workSubmission
        }).promise();
    } catch(error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    return {
        statusCode: 201,
        body: 'Thank you for submitting your availibility',
    };
}

export const handler = commonMiddleware(addGoingToWork);



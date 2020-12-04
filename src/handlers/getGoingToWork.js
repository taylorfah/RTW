import AWS from 'aws-sdk';
import commonMiddleware from "../lib/commonMiddleware";
import createError from 'http-errors';
import moment from "moment";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getGoingToWork(event, context) {
    let goingToWork;

    const { companyId } = event.queryStringParameters;
    const tomorrow = moment().add(1, 'd').endOf('day').toISOString();
    const tonight = moment().endOf('day').toISOString();

    const params = {
        TableName: process.env.GOING_TO_WORK_TABLE_NAME,
        IndexName: 'companyIdAndWorkDate',
        KeyConditionExpression: 'companyId = :companyId AND workDate BETWEEN :tonight AND :tomorrow',
        ExpressionAttributeValues: {
            ':companyId': companyId,
            ':tonight': tonight,
            ':tomorrow': tomorrow
        },
    };

    try {
        const result = await dynamodb.query(params).promise();
        goingToWork = result.Items;
    } catch (error) {
        throw new createError.InternalServerError(error);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(goingToWork),
    };
}

export const handler = commonMiddleware(getGoingToWork);
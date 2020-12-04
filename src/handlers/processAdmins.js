import AWS from 'aws-sdk';
import createError from 'http-errors';
import moment from "moment";
import _ from 'lodash';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

async function processAdmins(event, context) {
    let emailsToSend = [];
    let admins;

    //get all admin accounts.
    try {
        const result = await dynamodb.scan({
            TableName: process.env.ADMIN_TABLE_NAME
        }).promise();

        admins = result.Items;
    } catch (error) {
        throw new createError.InternalServerError(error);
    }

    await Promise.all(_.map(admins, async admin  => {
        let goingToWork;
        let companyId = admin.companyId;

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

        let totalNo = 0;
        let totalYes = 0;


        _.map(goingToWork, user => {
            if (user.status === 'yes') {
                totalYes += 1;
            } else {
                totalNo += 1;
            }
        });

        emailsToSend.push(
            sqs.sendMessage({
                QueueUrl: process.env.MAIL_QUEUE_URL,
                MessageBody: JSON.stringify({
                    subject: "Employees returning to work tomorrow",
                    recipient: admin.email,
                    body: {
                        Html: {
                            Data: `<h>Employees expecting to return tomorrow</h>` +
                                `<div>` +
                                `<p>${totalYes} Do plan on coming into work tomorrow.</p>` +
                                `</div> <div>` +
                                `<p>${totalNo} Do not plan on coming into work tomorrow.</p>`
                        }
                    },
                })
            }).promise()
        );
    }));

    return Promise.all(emailsToSend);
}

export const handler = processAdmins;
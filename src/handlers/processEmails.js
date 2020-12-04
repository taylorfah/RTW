import AWS from 'aws-sdk';
import _ from 'lodash';


const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

async function processEmails(event, context) {
    let users;
    let emailsToSend = [];

    // Get all emails
    try {
        const result = await dynamodb.scan({
            TableName: process.env.USER_TABLE_NAME
        }).promise();

        users = result.Items;
    } catch(error) {
        console.error(error);
    }

    _.map(users, user => {
        console.log(user.email);
        emailsToSend.push(
            sqs.sendMessage({
                QueueUrl: process.env.MAIL_QUEUE_URL,
                MessageBody: JSON.stringify({
                    subject: "Are you planning to return to work tomorrow?",
                    recipient: user.email,
                    body: {
                        Html: {
                            Data: `<h>Do you plan on going to work tomorrow?</h>` +
                                `<div>` +
                                `<a href="https://tbjwfvho1c.execute-api.us-west-1.amazonaws.com/dev/addGoingToWork?email=${user.email}.com&companyId=${user.companyId}&status=yes">Yes</a>` +
                                `</div> <div>` +
                                `<a href="https://tbjwfvho1c.execute-api.us-west-1.amazonaws.com/dev/addGoingToWork?email=${user.email}.com&companyId=${user.companyId}&status=no">No</a></div>`
                        }
                    },
                })
            }).promise()
        );
    });

    return Promise.all(emailsToSend);
}

export const handler = processEmails;
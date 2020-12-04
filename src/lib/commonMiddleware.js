import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";

export default handler => middy(handler)
    .use([
        httpJsonBodyParser(), // automatically parses HTTP requests with a JSON body and converts the body into an object
        httpEventNormalizer(), // gives access to query params in event.queryStringParameters
        httpErrorHandler(), // Automatically handles uncaught errors that contain the properties statusCode (number) and message (string) and creates a proper HTTP response
    ]);
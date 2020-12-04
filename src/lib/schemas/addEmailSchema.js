const schema = {
    properties: {
        body: {
            type: 'object',
            properties: {
                companyId: {
                    type: 'string'
                },
                email: {
                    type: 'string'
                },
            },
        },
    },
    required: ['body'],
};

export default schema;
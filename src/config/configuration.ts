export default () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    apiPrefix: process.env.API_PREFIX || '/api',
    database: {
        uri: process.env.MONGODB_URI,
    },
});

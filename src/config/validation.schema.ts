import * as Joi from 'joi';

export const validationSchema = Joi.object({
    MONGODB_URI: Joi.string().required(),
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
    API_PREFIX: Joi.string().default('/api'),
});

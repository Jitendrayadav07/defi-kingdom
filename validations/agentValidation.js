const Joi = require("joi");

const agentValidationSchema = {
    userPromptSchema: Joi.object().keys({
        user_input: Joi.string().required()
    }),

};
module.exports = agentValidationSchema;

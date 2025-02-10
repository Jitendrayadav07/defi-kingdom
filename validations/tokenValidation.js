const Joi = require("joi");

const tokenValidationSchema = {
    swapTokens: Joi.object().keys({
        amount: Joi.string().required(),
        from: Joi.string().required(),
        to: Joi.string().required(),
    }),
    withdrawFunds: Joi.object().keys({
        amount: Joi.string().required(),
        to: Joi.string().required(),
    })
}

module.exports = tokenValidationSchema;
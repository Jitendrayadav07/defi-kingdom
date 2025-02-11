const Joi = require("joi");

const tokenValidationSchema = {
    swapTokens: Joi.object().keys({
        amount: Joi.string(),
        from: Joi.string(),
        to: Joi.string(),
        action : Joi.string().required()
    }),
    withdrawFunds: Joi.object().keys({
        amount: Joi.string().required(),
        to: Joi.string().required(),
    })
}

module.exports = tokenValidationSchema;
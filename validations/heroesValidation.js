const Joi = require("joi");

const heroesValidationSchema = {
    getOwnerHeroesByAddressSchema: Joi.object().keys({
        address: Joi.string().required()
    }),

    getHeroesNetworkByIdSchema: Joi.object().keys({
        id: Joi.string().required()
    }),

    buyHeroesSchema: Joi.object().keys({
        hero_id: Joi.number().required()
    })
};
module.exports = heroesValidationSchema;

const Joi = require("joi");

const heroesValidationSchema = {
    getOwnerHeroesByAddressSchema: Joi.object().keys({
        address: Joi.string().required()
    }),

    getHeroesNetworkByIdSchema: Joi.object().keys({
        id: Joi.string().required()
    }),

    getHeroesByRaritySchema: Joi.object().keys({
        rarity: Joi.number().required()
    }),

    getHeroesByStatusSchema: Joi.object().keys({
        owner: Joi.string().required(),
        pjStatus: Joi.string().required()
    }),

};
module.exports = heroesValidationSchema;

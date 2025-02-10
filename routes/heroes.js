const express = require("express");
const router = express.Router();
const heroesController = require("../controllers/heroesController");
const JoiMiddleWare = require("../middlewares/joi/joiMiddleware");
const heroesValidationSchema = require("../validations/heroesValidation");
const userAuth = require("../middlewares/jsonwebtoken/joiAuthMiddleware");

router.get("/owner-heroes", 
    JoiMiddleWare(heroesValidationSchema.getOwnerHeroesByAddressSchema, "query"),
    heroesController.getOwnerHeroesByAddress
);

router.get("/heroes-network", 
    JoiMiddleWare(heroesValidationSchema.getHeroesNetworkByIdSchema, "query"),
    heroesController.getHeroesNetworkById
);

router.get("/heroes-rarity", 
    JoiMiddleWare(heroesValidationSchema.getHeroesByRaritySchema, "query"),
    heroesController.getHeroesByRarity
);

router.get("/heroes-status", 
    JoiMiddleWare(heroesValidationSchema.getHeroesByStatusSchema, "query"),
    heroesController.getHeroesByStatus
);

router.post("/buy-heroes", 
    userAuth,
    JoiMiddleWare(heroesValidationSchema.buyHeroesSchema, "body"),
    heroesController.buyHeroes
);

module.exports = router; 

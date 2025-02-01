const Response = require("../classes/Response");
const HEROES_CONSTANTS_STATUS = require("../constants/heroesConstants");
const HeroesService = require("../services/HeroesService");

const getOwnerHeroesByAddress = async (req, res) => {
    try {
        const ownerAddress = req.query.address;
        if (!ownerAddress) {
            return res.status(400).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 400));
        }

        const data = await HeroesService.getHeroesByOwner(ownerAddress);
        if (!data.heroes || data.heroes.length === 0) {
            return res.status(404).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 404));
        }

        return res.status(200).send(Response.sendResponse(true, data.heroes, HEROES_CONSTANTS_STATUS.HEROES_FETCHED, 200));
    } catch (error) {
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
};

const getHeroesNetworkById = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            return res.status(400).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 400));
        }

        const data = await HeroesService.getHeroesById(id);
        return res.status(200).send(Response.sendResponse(true, data.heroes, HEROES_CONSTANTS_STATUS.HEROES_FETCHED, 200));
    } catch (error) {
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
};

const getHeroesByRarity = async (req, res) => {
    try {
        const rarity = req.query.rarity;
        if (!rarity) {
            return res.status(400).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 400));         
        }

        const data = await HeroesService.getHeroesByRarity(rarity);
        return res.status(200).send(Response.sendResponse(true, data.heroes, HEROES_CONSTANTS_STATUS.HEROES_FETCHED, 200));
    } catch (error) {
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
};

const getHeroesByStatus = async (req, res) => {
    try {
        const owner = req.query.owner;
        const pjStatus = req.query.pjStatus;

        const data = await HeroesService.getHeroesByStatus(owner, pjStatus);
        return res.status(200).send(Response.sendResponse(true, data.heroes, HEROES_CONSTANTS_STATUS.HEROES_FETCHED, 200));
    } catch (error) {
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
};


module.exports = { getOwnerHeroesByAddress, getHeroesNetworkById ,getHeroesByRarity, getHeroesByStatus};

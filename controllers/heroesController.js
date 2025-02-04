const Response = require("../classes/Response");
const HEROES_CONSTANTS_STATUS = require("../constants/heroesConstants");
const HeroesService = require("../services/HeroesService");
const axios = require('axios');

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

        const heroesWithSkeletons = [];
        
        for (let i = 0; i < data.heroes.length; i++) {
            const hero = data.heroes[i];
            const heroId = hero.id;
            const url = `https://game.defikingdoms.com/assets/rigs/hero-rig/skeleton.json?heroId=${heroId}`;
            
            try {
                const response = await axios.get(url);
                hero.skeleton = response.data;  //
            } catch (error) {
                hero.skeleton = null;  
                console.error(`Failed to fetch skeleton for heroId: ${heroId}`, error);
            }
            heroesWithSkeletons.push(hero);
        }
        return res.status(200).send(Response.sendResponse(true, heroesWithSkeletons, HEROES_CONSTANTS_STATUS.HEROES_FETCHED, 200));
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

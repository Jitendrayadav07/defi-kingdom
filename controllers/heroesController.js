const Response = require("../classes/Response");
const HEROES_CONSTANTS_STATUS = require("../constants/heroesConstants");
const HeroesService = require("../services/HeroesService");
const axios = require('axios');


const fetchHeroSkeleton = async (heroId) => {
    const url = `https://heroes.defikingdoms.com/token/${heroId}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch skeleton for heroId: ${heroId}`, error);
        return null;
    }
};

const formatHeroData = (hero, skeleton) => {
    return {
        id: skeleton?.heroData?.id || hero.id,
        image: skeleton?.image || null,
        name: skeleton?.name || `${hero.firstName} ${hero.lastName}`,
        male: hero.gender,
        subclass: hero.subClassStr,
        rarity: hero.rarity,
        level: hero.level,
        generation: hero.generation,
        element: hero.element,
        background: hero.background,
        stamina: hero.stamina,
        summons: hero.summons,
        xp: hero.xp,
        hp: hero.hp,
        mp: hero.mp,
        class: hero.mainClassStr,
        strength: hero.strength,
        dexterity: hero.dexterity,
        agility: hero.agility,
        vitality: hero.vitality,
        endurance: hero.endurance,
        intelligence: hero.intelligence,
        wisdom: hero.wisdom,
        luck: hero.luck,
        mining: hero.mining,
        gardening: hero.gardening,
        foraging: hero.foraging,
        fishing: hero.fishing,
        strengthGrowthP: hero.strengthGrowthP / 100,
        dexterityGrowthP: hero.dexterityGrowthP / 100,
        agilityGrowthP: hero.agilityGrowthP / 100,
        vitalityGrowthP: hero.vitalityGrowthP / 100,
        enduranceGrowthP: hero.enduranceGrowthP / 100,
        intelligenceGrowthP: hero.intelligenceGrowthP / 100,
        wisdomGrowthP: hero.wisdomGrowthP / 100,
        luckGrowthP: hero.luckGrowthP / 100,
        strengthGrowthS: hero.strengthGrowthS / 100,
        dexterityGrowthS: hero.dexterityGrowthS / 100,
        agilityGrowthS: hero.agilityGrowthS / 100,
        vitalityGrowthS: hero.vitalityGrowthS / 100,
        enduranceGrowthS: hero.enduranceGrowthS / 100,
        intelligenceGrowthS: hero.intelligenceGrowthS / 100,
        wisdomGrowthS: hero.wisdomGrowthS / 100,
        luckGrowthS: hero.luckGrowthS / 100
    };
};

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

        const heroPromises = data.heroes.map(async (hero) => {
            const skeleton = await fetchHeroSkeleton(hero.id);
            return formatHeroData(hero, skeleton);
        });

        const heroesWithFilteredData = (await Promise.all(heroPromises)).filter(Boolean);

        return res.status(200).send(Response.sendResponse(true, heroesWithFilteredData, HEROES_CONSTANTS_STATUS.HEROES_FETCHED, 200));
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
        if (!data.heroes || data.heroes.length === 0) {
            return res.status(404).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 404));
        }

        const hero = data.heroes[0];
        const skeleton = await fetchHeroSkeleton(hero.id);
        const formattedHero = formatHeroData(hero, skeleton);

        return res.status(200).send(Response.sendResponse(true, formattedHero, HEROES_CONSTANTS_STATUS.HEROES_FETCHED, 200));
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

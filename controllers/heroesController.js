const Response = require("../classes/Response");
const HEROES_CONSTANTS_STATUS = require("../constants/heroesConstants");
const HeroesService = require("../services/HeroesService");
const TOKEN_CONSTANTS = require("../constants/tokenConstants");
const db = require("../config/db.config");
const axios = require('axios');
const { ethers } = require("ethers");



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
            return res.status(400).send(Response.sendResponse(false, [], HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 400));
        }

        const data = await HeroesService.getHeroesByOwner(ownerAddress);
        if (!data.heroes || data.heroes.length === 0) {
            return res.status(404).send(Response.sendResponse(false, [], HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 404));
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

const buyHeroes = async (req, res) => {
    try {

        let { hero_id } = req.body;

        let user = await db.users.findOne({
            where: {
                email: req.user.email
            }
        });

        // Contract details
        const CONTRACT_ADDRESS = "0xc390fAA4C7f66E4D62E59C231D5beD32Ff77BEf0";
        const ABI = [
            "function bid(uint256 amount, uint256 price) public",
            "function getCurrentPrice(uint256 _tokenId) view returns (uint256)",
        ];

        const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.DFK_RPC_URL);

        let privateKey = user.wallet_private_key;

        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

         // Get the current required bid price
         const currentPrice = await contract.getCurrentPrice(hero_id);
         console.log(`Current price for NFT ${hero_id}:`, currentPrice);
        //  console.log(`Current price for NFT ${hero_id}:`, ethers.formatUnits(currentPrice, 18), "CRYSTAL");

        const crystalAmountBN = currentPrice//ethers.toBigInt(amount);
        console.log("Crystal amount:", crystalAmountBN);

        // Send transaction
        const tx = await contract.bid(hero_id, crystalAmountBN);
        console.log("Transaction sent:", tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);

        return res.status(200).send(Response.sendResponse(true, null, HEROES_CONSTANTS_STATUS.HEROES_BOUGHT, 200));

    } catch (error) {
        console.log(error);
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
}


module.exports = { getOwnerHeroesByAddress, getHeroesNetworkById, getHeroesByRarity, getHeroesByStatus, buyHeroes };

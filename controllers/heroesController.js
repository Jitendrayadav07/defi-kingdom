const Response = require("../classes/Response");
const HEROES_CONSTANTS_STATUS = require("../constants/heroesConstants");
const HeroesService = require("../services/HeroesService");
const TOKEN_CONSTANTS = require("../constants/tokenConstants");
const db = require("../config/db.config");
const axios = require('axios');
const { ethers } = require("ethers");
const RPC_URL = TOKEN_CONSTANTS.DFK_RPC_URL;
const QUEST_CORE_CONTRACT_ADDRESS = "0x530fff22987E137e7C8D2aDcC4c15eb45b4FA752"; // Mainnet QuestCoreV3 contract address
const FISHING_QUEST_ADDRESS = "0x08BDdaB7d681c6406fE61d261c26Da80678874f6";  // Mainnet Fishing Quest contract address
const FORAGING_QUEST_ADDRESS = "0x08BDdaB7d681c6406fE61d261c26Da80678874f6"; // Mainnet Foraging Quest contract address

const QUEST_ABI = [
    "function getHeroQuest(uint256 heroId) view returns (tuple(uint256 id, uint256 questInstanceId, uint8 level, uint256[] heroes, address player, uint256 startBlock, uint256 startAtTime, uint256 completeAtTime, uint8 attempts, uint8 status, uint8 questType))",
    "function startQuest(uint256[] _heroIds, uint256 _questInstanceId, uint8 _attempts, uint8 _level, uint8 _type)",
    "function completeQuest(uint256 _heroId)",
];

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

const formatHeroData = async (hero, skeleton) => {
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
        staminaFullAt : hero.staminaFullAt,
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
        mining: hero.mining / 10,
        gardening: hero.gardening / 10,
        foraging: hero.foraging / 10,
        fishing: hero.fishing / 10,
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
        luckGrowthS: hero.luckGrowthS / 100,
        currentQuest : hero.currentQuest
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

const getSelectedHeroId = async () => {
    const heroApiUrl = "https://api.defikingdoms.com/heroes";
    
    const filterParams = {
        flatten: true,
        limit: 4,
        params: [
            { field: "saleprice", operator: ">=", value: "1000000000000000000" },
            { field: "network", operator: "=", value: "dfk" },
            { field: "hasvalidcraftinggenes", operator: "=", value: true },
            { field: "hastaintedgenes", operator: "=", value: false }
        ],
        offset: 0,
        order: {
            orderBy: "saleprice",
            orderDir: "asc"
        }
    };

    try {
        const heroResponse = await axios.post(heroApiUrl, { ...filterParams }, {
            headers: { "Content-Type": "application/json" },
        });
        const heroIds = heroResponse.data.map(hero => hero[0]);
        const selectedHeroId = heroIds[1]; 

        return selectedHeroId;
    } catch (error) {
        console.error("Error fetching hero data:", error);
        return null; 
    }
};

const heroesStamina = async (req, res) => {
    try {
        let user = await db.users.findOne({
            where: {
                email: req.user.email
            }
        });

        const CONTRACT_ADDRESS = "0x530fff22987E137e7C8D2aDcC4c15eb45b4FA752";

        const ABI = [   
            "function getCurrentStamina(uint256 _heroId) view returns (uint256)",
        ];

        const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.DFK_RPC_URL);

        let privateKey = user.wallet_private_key;

        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

        const hero_id = req.query.id;
        const stamina = await contract.getCurrentStamina(hero_id);

        const staminaValue = Number(stamina);

        return res.status(200).send(Response.sendResponse(true, staminaValue, HEROES_CONSTANTS_STATUS.HEROES_FETCHED, 200));
    }
    catch (error) {
        console.log(error);
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
}

async function getHeroeStamina(heroId) {
    const CONTRACT_ADDRESS = "0x530fff22987E137e7C8D2aDcC4c15eb45b4FA752";
    const ABI = [   
        "function getCurrentStamina(uint256 _heroId) view returns (uint256)",
    ];

    const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.DFK_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    const stamina = await contract.getCurrentStamina(heroId);
    return stamina;
}

const buyHeroes = async (req, res) =>{
    try {
        const hero_id = await getSelectedHeroId();
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
         console.log(`Current price for NFT ${hero_id}:`, ethers.formatUnits(currentPrice, 18), "CRYSTAL");

        const crystalAmountBN = currentPrice//ethers.toBigInt(amount);

        // Send transaction
        const tx = await contract.bid(hero_id, crystalAmountBN);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);

        return res.status(200).send(Response.sendResponse(true, null, HEROES_CONSTANTS_STATUS.HEROES_BOUGHT, 200));

    } catch (error) {
        console.log(error);
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
}

const heroesStartQuest = async (req, res) => {
    try {
        let user = await db.users.findOne({ where: { email: req.user.email } });
        let wallet_address = user.wallet_address;
        let wallet_private_key = user.wallet_private_key;
        const data = await HeroesService.getHeroesByOwner(wallet_address);
        if (!data.heroes || data.heroes.length === 0) {
            return res.status(404).send(Response.sendResponse(false, [], HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 404));
        }

        const hero_id = data.heroes[1].id
        console.log("hero_id",hero_id);
        const skeleton = await fetchHeroSkeleton(hero_id);

        let hero_formated_data = await formatHeroData(data.heroes[0], skeleton);
        console.log("hero_formated_data",hero_formated_data);
        let stamina = await getHeroeStamina(hero_id);
  
        if(stamina < 7){
            return res.status(400).send(Response.sendResponse(false, null, "Hero stamina is not enough", 400));
        }

        let heroIds = Array.isArray(hero_id) ? hero_id : [hero_id];

        const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.DFK_RPC_URL);
        const wallet = new ethers.Wallet(wallet_private_key, provider);
        const contract = new ethers.Contract(QUEST_CORE_CONTRACT_ADDRESS, QUEST_ABI, wallet);
        let heroes_quest = await contract.getHeroQuest(hero_id);
        console.log("heroes_quest",heroes_quest);
        let questStatus = Number(heroes_quest[9]);
        console.log("questStatus",questStatus);

        const QuestStatus = {
            NONE: 0,
            STARTED: 1,
            COMPLETED: 2,
            CANCELED: 3,
            EXPEDITION: 4
        };
 
        if (questStatus === QuestStatus.STARTED || questStatus === QuestStatus.EXPEDITION) {
            return res.status(400).send(Response.sendResponse(false, null, "Hero is already on an active quest", 400));
        }

        const attempts = 1;
        const level = 0;
        const questTypeId = 0;
        const questInstanceId = 1; 
        console.log(`🚀 Starting Quest for heroes: ${heroIds}`);
        const tx = await contract.startQuest(heroIds, questInstanceId, attempts, level, questTypeId )
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        let heroes_quest_new = await contract.getHeroQuest(hero_id);
        const questData = {
            hero_id: hero_id,
            quest_start_time: heroes_quest_new[6].toString(),
            quest_end_time: heroes_quest_new[7].toString(),
            quest_status: heroes_quest_new[1].toString(),
            hero_level: heroes_quest_new[1].toString(),
            hero_experience: heroes_quest_new[2].toString(),
            wallet_address: heroes_quest_new[4],
            start_time: heroes_quest_new[6].toString(),
            end_time: heroes_quest_new[7].toString(),
            quest_instance_id: heroes_quest_new[8].toString(),
            hero_address: heroes_quest_new[5]
        };
        
        await db.hero_quests.create(questData);

        return res.status(200).send(Response.sendResponse(true, receipt, "Quest started successfully", 200));
    } catch (error) {
        console.error("❌ Error starting quest:", error);
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runQuestCheck = async () => {
    try {
        const quest = await db.hero_quests.findOne({
            where: {
                quest_status: 1,
            },
        });

        if (quest) {
            const currentTimestamp = Math.floor(Date.now() / 1000); 
            console.log("currentTimestamp",currentTimestamp);
            if (currentTimestamp >= quest.end_time) {
                console.log(`Quest for hero ${quest.hero_id} has ended. Completing quest...`);
                await heroesCompleteQuest(quest.hero_id,quest.wallet_address);
            }
        } else {
            console.log('No quest found or quest is not started yet.');
        }
    } catch (error) {
        console.error('Error in quest check:', error);
    }
};

const startCronJob = async () => {
    while (true) {
        await runQuestCheck(); 
        console.log('Waiting for 20 seconds before next check...');
        await sleep(5000); 
    }
};

startCronJob();


const heroesCompleteQuest = async (hero_id,wallet_address) => {
    try {
        let user = await db.users.findOne({ where: { wallet_address: wallet_address } });
        let wallet_private_key = user.wallet_private_key;

        const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.DFK_RPC_URL);
        const wallet = new ethers.Wallet(wallet_private_key, provider);
        const contract = new ethers.Contract(QUEST_CORE_CONTRACT_ADDRESS, QUEST_ABI, wallet);

        console.log(`🏆 Completing Quest for hero: ${hero_id}`);
        const tx = await contract.completeQuest(hero_id);
        const receipt = await tx.wait();
        console.log("✅ Quest completed in block:", receipt.blockNumber);
        await db.hero_quests.update({ quest_status: 3 }, { where: { hero_id: hero_id } });
        return true
    } catch (error) {
        console.error("❌ Error completing quest:", error);
        return false;
    }
};


         

module.exports = {
    getOwnerHeroesByAddress, 
    getHeroesNetworkById, 
    getHeroesByRarity,
    getHeroesByStatus, 
    heroesStamina ,
    buyHeroes,
    heroesStartQuest ,
    heroesCompleteQuest
};

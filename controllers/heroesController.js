const Response = require("../classes/Response");
const HEROES_CONSTANTS_STATUS = require("../constants/heroesConstants");

const getOwnerHeroesByAddress = async (req, res) => {
    try {
        const { GraphQLClient, gql } = await import('graphql-request');

        const endpoint = 'https://api.defikingdoms.com/graphql';
        const client = new GraphQLClient(endpoint);

        const query = gql`
            query GetHeroesByOwner($owner: String!) {
                heroes(where: { owner: $owner }) {
                    id
                    mainClass
                    rarity
                }
            }
        `;

        const ownerAddress = req.query.address;

        if (!ownerAddress) {
            return res.status(400).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 400));
        }

        const variables = { owner: ownerAddress };
        const data = await client.request(query, variables);

        if (!data.heroes || data.heroes.length === 0) {
            return res.status(404).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 404));
        }

        return res.status(200).send(Response.sendResponse(true, data.heroes, HEROES_CONSTANTS_STATUS.HEROES_FETCHED, 200));
    } catch (error) {
        console.error('Error fetching heroes by owner:', error);
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));    
    }
};

const getHeroesNetworkById = async (req, res) => {
    try {
        const { GraphQLClient, gql } = await import('graphql-request');

        const endpoint = 'https://api.defikingdoms.com/graphql';
        const client = new GraphQLClient(endpoint);

        const query = gql`
            query GetHeroesNetworkById($id: ID!) {
                heroes(where: { id: $id  }) {
                    id
                    mainClass
                    network
                    owner {
                        name
                    }
                }
            }
        `;

        const id = req.query.id;

        if (!id) {
            return res.status(400).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 400));
        }

        const variables = { id: id };
        const data = await client.request(query, variables);

        if (!data.heroes || data.heroes.length === 0) {
            console.error("No heroes found for ID:", id);
            return res.status(404).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 404));
        }

        return res.status(200).send(Response.sendResponse(true, data.heroes, HEROES_CONSTANTS_STATUS.HEROES_FETCHED, 200));

    } catch (error) {
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
};


const getHeroesByRarity = async (req, res) => {
    try {
        const { GraphQLClient, gql } = await import('graphql-request');

        const endpoint = 'https://api.defikingdoms.com/graphql';
        const client = new GraphQLClient(endpoint);

        const query = gql`  
            query GetHeroesByRarity($rarity: Int!) {  
                heroes(where: { rarity: $rarity }) {
                    id
                    mainClass
                    rarity
                }
            }
        `;

        const rarity = req.query.rarity;

        if (!rarity) {
            return res.status(400).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 400));
        }

        const rarityInt = parseInt(rarity, 10);

        if (isNaN(rarityInt)) {
            return res.status(400).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.INVALID_RARITY, 400));
        }

        const variables = { rarity: rarityInt };
        const data = await client.request(query, variables);

        if (!data.heroes || data.heroes.length === 0) {
            return res.status(404).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 404));
        }

        return res.status(200).send(Response.sendResponse(true, data.heroes, HEROES_CONSTANTS_STATUS.HEROES_FETCHED, 200));

    } catch (error) {
        console.error('Error fetching heroes by rarity:', error);
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));    
    }
}

const getHeroesByStatus = async (req, res) => {
    try {
        const { GraphQLClient, gql } = await import('graphql-request');

        const endpoint = 'https://api.defikingdoms.com/graphql';
        const client = new GraphQLClient(endpoint);

        const query = gql`
            query GetHeroesByStatus($owner: String!, $pjStatus: String!) {
                heroes(where: { owner: $owner, pjStatus: $pjStatus }) {
                    id
                    mainClass
                    rarity
                }
            }
        `;

        const owner = req.query.owner;
        const pjStatus = req.query.pjStatus;

        const variables = { owner: owner, pjStatus: pjStatus };
        const data = await client.request(query, variables);

        return res.status(200).send(Response.sendResponse(true, data, HEROES_CONSTANTS_STATUS.HEROES_FETCHED, 200));

    } catch (error) {
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
}

module.exports = { getOwnerHeroesByAddress, getHeroesNetworkById, getHeroesByRarity, getHeroesByStatus };
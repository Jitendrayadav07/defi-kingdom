const GraphQLService = require("./graphQLService.js");

class HeroesService {
    async getHeroesByOwner(ownerAddress) {
        const query = `
            query GetHeroesByOwner($owner: String!) {
                heroes(where: { owner: $owner }) {
                    id
                    mainClass
                    rarity
                }
            }
        `;
        return await GraphQLService.request(query, { owner: ownerAddress });
    }

    async getHeroesById(id) {
        const query = `
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
        return await GraphQLService.request(query, { id });
    }

    async getHeroesByRarity(rarity) {
        const query = `
            query GetHeroesByRarity($rarity: Int!) {  
                heroes(where: { rarity: $rarity }) {
                    id
                    mainClass
                    rarity
                }
            }
        `;
        return await GraphQLService.request(query, { rarity: parseInt(rarity, 10) });
    }

    async getHeroesByStatus(owner, pjStatus) {
        const query = `
            query GetHeroesByStatus($owner: String!, $pjStatus: String!) {
                heroes(where: { owner: $owner, pjStatus: $pjStatus }) {
                    id
                    mainClass
                    rarity
                }
            }
        `;
        return await GraphQLService.request(query, { owner, pjStatus });
    }
}

module.exports = new HeroesService();

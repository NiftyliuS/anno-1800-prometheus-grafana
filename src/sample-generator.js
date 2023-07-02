const getRandomIsh = (base) => base + (Math.random() * base - base / 2)
const { v4: uuidv4 } = require('uuid');

const generateProducts = (prefix, itemCount = 10, baseValue = 10) =>
    (new Array(itemCount).fill(0).map((_, index) => ({
            "name": `${prefix} Item ${index}`,
            "value": getRandomIsh(baseValue)
        }))
    );

const generateBuildingSummary = (itemCount = 10, baseValue = 1000) =>
    (new Array(itemCount).fill(0).map((_, index) => ({
            "type": `Building type ${index}`,
            "count": getRandomIsh(baseValue)
        }))
    );

const generateProductionItems = (itemCount = 2, baseValue = 2) =>
    (new Array(itemCount).fill(0).map((_, index) => ({
            "name": `Resource type ${index}`,
            "rate": getRandomIsh(baseValue)
        }))
    );


const generateProductionBuilding = (type,id, productionCount = 1, consumptionCount = 2) => ({
    type,
    building_id: id,
    efficiency: getRandomIsh(50),
    production: generateProductionItems(productionCount),
    consumption: generateProductionItems(productionCount),
})

const generateProductionBuildings = (buildingsCount = 100) =>
    new Array(buildingsCount).fill(0).map(
        (_, index) => generateProductionBuilding(`Building type ${Math.floor(index / 10)}`, index)
    );


const generateIsland = (islandId = 'abcdef', islandName = 'John Doe Island') => ({
    island_id: islandId,
    island_name: islandName,
    island_inventory: generateProducts( 'Inventory', 10, 25),
    island_production: generateProducts('Production',10, 25),
    island_consumption: generateProducts('Consumption',10, 25),
    island_buildings_summary: generateBuildingSummary(10, 250),
    island_production_buildings: generateProductionBuildings(100)
})


const generateWorld = (playerId, worldId="abcdef", worldName="Unknown World",islandCount = 3) => ({
    "world_id": worldId,
    "world_name": worldName,
    "islands":  new Array(islandCount).fill(0).map(
        (_, index) => generateIsland(`${playerId}-${worldId}-${index}`, `Island (${playerId}-${worldId}-${index})`)
    )
})



const generateRandomData = () => (
    {
        "session_id": "string",
        "session_name": "string?",
        "session_data": {
            "players": [
                {
                    "player_id": "aaaaa",
                    "player_name": "Player A",
                    "worlds": [
                        generateWorld('aaaaa','old', 'Old World', 4),
                        generateWorld('aaaaa','new', 'New World', 2)
                    ]
                },
                {
                    "player_id": "bbbbb",
                    "player_name": "Player B",
                    "worlds": [
                        generateWorld("bbbbb",'old', 'Old World', 2),
                        generateWorld("bbbbb",'new', 'New World', 1)
                    ]
                },
                {
                    "player_id": "ccccc",
                    "player_name": "Player C",
                    "worlds": [
                        generateWorld("ccccc",'old', 'Old World', 3),
                        generateWorld("ccccc",'new', 'New World', 1)
                    ]
                },
                {
                    "player_id": "ddddddd",
                    "player_name": "Player D",
                    "worlds": [
                        generateWorld("ddddddd",'old', 'Old World', 2),
                        generateWorld("ddddddd",'new', 'New World', 0)
                    ]
                },
            ]
        }
    }
)


module.exports = {
    generateRandomData
}
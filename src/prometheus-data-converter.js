const ZERO_VALUE = 0.000001;
const metricStats = {
    island_inventory_resource: [
        ``,
        `# HELP island_inventory_resource The island storage values for each resource`,
        `# TYPE island_inventory_resource gauge`,
        ``,
    ],
    island_production_resource: [
        ``,
        `# HELP island_production_resource The amount of production per minute for each resource.`,
        `# TYPE island_production_resource gauge`,
        ``
    ],
    island_consumption_resource: [
        ``,
        `# HELP island_consumption_resource The amount of consumed resources for each resource per minute.`,
        `# TYPE island_consumption_resource gauge`,
        ``,
    ],
    island_buildings_by_type: [
        ``,
        `# HELP island_buildings_by_type The amount of buildings of each type.`,
        `# TYPE island_buildings_by_type gauge`,
        ``,
    ],
    island_production_buildings_efficiency: [
        ``,
        `# HELP island_production_buildings_efficiency Info about each building and its efficiency.`,
        `# TYPE island_production_buildings_efficiency gauge`,
        ``,
    ],
    island_production_buildings_consumption_rate: [
        ``,
        `# HELP island_production_buildings_consumption_rate Info about each building and its resource consumption rate.`,
        `# TYPE island_production_buildings_consumption_rate gauge`,
        ``,
    ],
    island_production_buildings_production_rate: [
        ``,
        `# HELP island_production_buildings_production_rate Info about each building and its resource production rate.`,
        `# TYPE island_production_buildings_production_rate gauge`,
        ``,
    ]

}


const convertIslandProductionBuildingProductionToPrometheus = (labelParts, items) => ({
    metricName: 'island_production_buildings_production_rate',
    rows: items.reduce(
        (agr, {type, building_id, production}) => {
            production.forEach(
                ({name, rate}) => {
                    agr.push(
                        `island_production_buildings_production_rate{${
                            [
                                ...labelParts,
                                `building_type="${type}"`,
                                `resource_name="${name}"`,
                                `building_id="${building_id}"`,
                            ].join()}} ${rate || ZERO_VALUE}`
                    )
                }
            )
            return agr;
        }, []
    )
})


const convertIslandProductionBuildingConsumptionToPrometheus = (labelParts, items) => ({
    metricName: 'island_production_buildings_consumption_rate',
    rows: items.reduce(
        (agr, {type, building_id, consumption}) => {
            consumption.forEach(
                ({name, rate}) => {
                    agr.push(
                        `island_production_buildings_consumption_rate{${
                            [
                                ...labelParts,
                                `building_type="${type}"`,
                                `resource_name="${name}"`,
                                `building_id="${building_id}"`,
                            ].join()}} ${rate || ZERO_VALUE}`
                    )
                }
            )
            return agr;
        }, []
    )
})

const convertIslandProductionBuildingEfficiencyToPrometheus = (labelParts, items) => ({
    metricName: 'island_production_buildings_efficiency',
    rows: items.map(
        ({type, building_id, efficiency}) =>
            `island_production_buildings_efficiency{${
                [
                    ...labelParts,
                    `building_type="${type}"`,
                    `building_id="${building_id}"`,
                ].join()}} ${efficiency || ZERO_VALUE}`
    )
})

const convertIslandBuildingsSummaryToPrometheus = (labelParts, items) => ({
    metricName: 'island_buildings_by_type',
    rows: items.map(
        ({type, count}) =>
            `island_buildings_by_type{${[
                ...labelParts,
                `building_type="${type}"`,
            ].join()}} ${count || ZERO_VALUE}`
    )
})

const convertIslandConsumptionToPrometheus = (labelParts, items) => ({
    metricName: 'island_consumption_resource',
    rows: items.map(
        ({name, value}) =>
            `island_consumption_resource{${[...labelParts, `resource_name="${name}"`].join()}} ${value || ZERO_VALUE}`
    )
})

const convertIslandProductionToPrometheus = (labelParts, items) => ({
    metricName: 'island_production_resource',
    rows: items.map(
        ({name, value}) =>
            `island_production_resource{${[...labelParts, `resource_name="${name}"`].join()}} ${value || ZERO_VALUE}`
    )
})

const convertIslandInventoryToPrometheus = (labelParts, items) => ({
    metricName: 'island_inventory_resource',
    rows: items.map(
        ({name, value}) =>
            `island_inventory_resource{${[...labelParts, `resource_name="${name}"`].join()}} ${value || ZERO_VALUE}`
    )
})

const convertIslandToPrometheus = (baseLabelParts, island, index) => {
    baseLabelParts.push(
        `island_id="${island.island_id}"`,
        `island_name="${island.island_name || `Island ${index}`}"`,
    );
    const {
        island_inventory,
        island_production,
        island_consumption,
        island_production_buildings,
        island_buildings_summary,
    } = island;

    if (process.env.ADD_HARBOR) {
        island_buildings_summary.push({
            type: 'Harbor',
            count: 1
        });
        if (process.env.DEBUG) console.log(`      * Added Harbor, count 1 to island ${island.island_id}`)
    }
    const aggregateArray = [
        island_inventory && convertIslandInventoryToPrometheus(baseLabelParts, island_inventory),
        island_production && convertIslandProductionToPrometheus(baseLabelParts, island_production),
        island_consumption && convertIslandConsumptionToPrometheus(baseLabelParts, island_consumption),
        island_production_buildings && convertIslandProductionBuildingEfficiencyToPrometheus(baseLabelParts, island_production_buildings),
        island_production_buildings && convertIslandProductionBuildingConsumptionToPrometheus(baseLabelParts, island_production_buildings),
        island_production_buildings && convertIslandProductionBuildingProductionToPrometheus(baseLabelParts, island_production_buildings),
        island_buildings_summary && convertIslandBuildingsSummaryToPrometheus(baseLabelParts, island_buildings_summary),
        // Add default Harbor for player owned islands manually because its not technically a building
    ].filter(val => !!val);

    if (process.env.DEBUG) {
        console.log(`      Island ID: ${island.island_id} - metrics: ${
            aggregateArray.reduce((total, {rows}) => total + rows.length, 0)
        }`);
        console.log(`      Island Label:\n${baseLabelParts.map(v => `        ${v}`).join('\n')}`);
    }

    return aggregateArray;
}

const convertWorldToPrometheus = (baseLabelParts, world, index) => {
    baseLabelParts.push(
        `world_id="${world.world_id}"`,
        `world_name="${world.world_name || `World ${index}`}"`,
    );
    if (process.env.DEBUG) {
        console.log(`  World ID: ${world.world_id} - Islands (${world.islands.length}): ${world.islands.map(({island_id}) => island_id).join()}`)
        console.log(`  World Label:\n${baseLabelParts.map(v => `    ${v}`).join('\n')}`)
    }
    return world.islands.reduce(
        (agr, island, index) => {
            if (process.env.DEBUG) console.log(' ')
            agr.push(...convertIslandToPrometheus([...baseLabelParts], island, index));
            return agr;
        }, []
    );
}


const convertPlayerDataToPrometheus = (baseLabelParts, player, index) => {
    baseLabelParts.push(
        `player_id="${player.player_id}"`,
        `player_name="${player.player_name || `Player ${index}`}"`,
    );
    if (process.env.DEBUG) {
        console.log(`Player ID: ${player.player_id} - Worlds (${player.worlds.length}): ${player.worlds.map(({world_id}) => world_id).join()}`)
    }
    return player.worlds.reduce(
        (agr, world, index) => {
            if (process.env.DEBUG) console.log(' ')
            agr.push(...convertWorldToPrometheus([...baseLabelParts], world, index));
            return agr;
        }, []
    );
}


const combineMetrics = (metrics) => {
    const aggregatedMetrics = metrics.reduce(
        (agr, {metricName, rows}) => {
            agr[metricName] = (agr[metricName] || []);
            agr[metricName].push(...rows)
            return agr;
        }, {}
    );
    return Object.keys(aggregatedMetrics).reduce(
        (allRows, key) => {
            if (!metricStats[key]) return allRows;
            allRows.push(...metricStats[key], ...aggregatedMetrics[key]);
            return allRows;
        }, []
    )
}

const convertAnnoJsonToPrometheus = (data) => {
    const {players} = data.session_data;
    const labelParts = [
        `session_id="${data.session_id}"`,
        `session_name="${data.session_name || 'Current Session'}"`,
    ]

    if (process.env.DEBUG) {
        console.log(' ');
        console.log(`Session ID: ${data.session_id} - Players (${players.length}): ${players.map(({player_id}) => player_id).join()}`);
    }

    const metrics = players.reduce(
        (agr, player, index) => {
            if (process.env.DEBUG) console.log(' ')
            agr.push(...convertPlayerDataToPrometheus([...labelParts], player, index));
            return agr;
        }, []
    );

    const combinedMetrics = combineMetrics(metrics);

    return combinedMetrics.join(`\n`);
}

module.exports = {
    convertAnnoJsonToPrometheus
}
const express = require('express')
const {generateRandomData} = require("./src/sample-generator");
const {convertAnnoJsonToPrometheus} = require("./src/prometheus-data-converter");
const axios = require("axios");
const app = express();
const port = 3033;

app.get('/metrics-sample', (req, res) => {
    console.log('Metrics sample generated!')
    res.send(generateRandomData())
})

app.get('/metrics', (req, res) => {
    (async () => {
        if (!process.env.DATA_URL) {
            console.log('Sample metrics sent!');
            const sampleData = generateRandomData();
            return convertAnnoJsonToPrometheus(sampleData);
        }
        const res = await axios.get(process.env.DATA_URL, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (process.env.DEBUG) {
            console.log(` `);
            console.log(`>>> Gathering Metrics from ${process.env.DATA_URL}`);
            console.log("Got data of type", typeof res.data);
            try {
                if (process.env.DEBUG_INPUT)
                    console.log('Data: ', JSON.stringify(res.data, null, 2));
            } catch (e) {
                console.log(res.data || null)
            }
        }
        const {data} = res;
        console.log(`Converting data for Prometheus`);
        return convertAnnoJsonToPrometheus(data);
    })().then((data) => res.send(data)).catch((e) => {
        console.error(e);
        res.statusCode = 500
        res.send(e.message)
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}.`)

})
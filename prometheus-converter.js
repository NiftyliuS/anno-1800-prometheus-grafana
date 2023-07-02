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

        const {data} = await axios.get(process.env.DATA_URL, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
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
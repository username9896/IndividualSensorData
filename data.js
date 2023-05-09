/**
* @swagger
* components:
*   schema:
*     sensorvalues:
*       type: object
*       properties:
*         ultradata:
*           type: string
*         motiondata:
*           type: string
*         date:
*           type: string
* 
* @swagger
* /sensorvalues/sensor-values:
*  get:
*      title: Sensor Data API's
*      summary: To get the sensor data
*      description: This API is used for fetching the data from MongoDB
*      responses:
*          200:
*              description: Successfully loaded the data
*              content:
*                  application/json:
*                      schema:
*                          type: array
*                          items:
*                              $ref: '#/components/schema/sensorvalues'
*/

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://vicky4830:vicky111@cluster0.lmsnl7w.mongodb.net/mydb', { useNewUrlParser: true, useUnifiedTopology: true });

const mqtt = require('mqtt');
const express = require('express');
const bodyParser = require('body-parser');
const Logindata = require('./models/device');
const swaggerjsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const port = 5003;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Active Sense",
            version: "0.1.0",
        },
        servers: [
            {
                url: "https://individualsensordata.onrender.com",
            },
        ],
    },
    apis: ["./*.js"],
};

const specs = swaggerjsdoc(options);

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs)
);

const brokerUrl = 'mqtt://localhost:1884';
const dandt = 'date'
const ultrasonicdata = 'ultradata'
const motionsensordata = 'motiondata'

const client = mqtt.connect(brokerUrl);

// app.get('/sensorvalues/sensor-values', (req, res) => {
//     Logindata.find()
//         .then(data => {
//             res.send(data);
//         })
// });

app.get('/sensorvalues/sensor-values', async (req, res) => {
    try {
        const data = await Logindata.find();
        res.send(data);
    } catch (err) {
        console.error('Failed to fetch sensor data', err);
        res.status(500).send('An error occurred');
    }
});

client.on('connect', function () {
    console.log('Connected to MQTT broker');

    client.subscribe(dandt, function (err) {
        if (err) {
            console.error('Failed to subscribe to dandt', err);
        } else {
            console.log('Subscribed to topic', dandt);
        }
    });

    client.subscribe(ultrasonicdata, function (err) {
        if (err) {
            console.error('Failed to subscribe to ultrasonicdata', err);
        } else {
            console.log('Subscribed to topic', ultrasonicdata);
        }
    });

    client.subscribe(motionsensordata, function (err) {
        if (err) {
            console.error('Failed to subscribe to ultrasonicdata', err);
        } else {
            console.log('Subscribed to topic', motionsensordata);
        }
    });
});

a = 0;
b = 0;
c = 0;

client.on('message', function (topic, message) {
    // console.log('Received message on topic', topic, ' ', message.toString());

    if (topic === 'date') {
        a = message;
    }
    else if (topic == 'ultradata') {
        b = message;
    }
    else if (topic == 'motiondata') {
        c = message;
    }

    if (a && b && c) {
        const NewDevice = new Logindata({
            ultradata: b,
            motiondata: c,
            date: a,
        })
        NewDevice.save()
    }
})

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
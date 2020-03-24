
const rp = require('request-promise');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.static('api/public'));
const port = 3000;


test_data = {
"MSRED": { "participants": 1 },
"UP":  { "participants": 1 },
"CCCP": { "participants": 1 },
"Conservation": { "participants": 1 },
"HP": { "participants": 1 },
"MArch500N": { "participants": 1 },
"MArch500S": { "participants": 1 },
"MArch600N": { "participants": 1 },
"MArch600S": { "participants": 1 },
"MArch700": { "participants": 1 },
"MSHP301": { "participants": 1 },
"MSUD206": { "participants": 1 },
"UD": { "participants": 1 },
"WoodShop": { "participants": 1 },
"MakerSpace": { "participants": 1 },
"March": { "participants": 1 },
"MSRED": { "participants": 1 },
"MSUP202": { "participants": 1 },
"UPPhD": { "participants": 1 },
"GSAPP": { "participants": 1 },
"RED": { "participants": 1 }
}



app.get('/', (req,res) => res.send(req.body));

app.post('/webhook_receive/someone_left_or_joined', (req,res) => {

    // log meeting to database
    console.log(req.body.event);
    console.log(req.body.payload);
    console.log(req.body.payload.participant);
    res.status(200);
});

app.get('/api/meetings/all', (req,res) => {
    res.json(test_data);
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));


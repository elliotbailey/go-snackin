import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { processInput } from '../api/natural-language.js';

export async function startServer() {

    const app = express();
    app.use(express.json());

    app.listen(process.env.PORT, () => {
        console.log(`Go Snackin' server running on port ${process.env.PORT}`);
    });

    app.post('/api/nlp', async (req, res) => {
        // curl -i -X POST -H 'Content-Type: application/json' -d '{"input":"Lets go from Sydney to Melbourne and grab a beer"}' localhost:3000/api/nlp
        res.status(200).json({ output: await processInput(req.body.input) });
    });

}

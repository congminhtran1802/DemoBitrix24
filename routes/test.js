const express = require('express');
const fs = require('fs');
const router = express.Router();
const axios = require('axios');

function saveTokens(tokens) {
    fs.writeFileSync('tokens.json', JSON.stringify(tokens));
}

router.post('/install', async (req, res) => {
    const accessToken = req.body['auth[access_token]'];
    const refreshToken = req.body['auth[refresh_token]'];
    const expiresIn = req.body['auth[expires_in]'];

    console.log('Install App event received:', req.body);

    if (!accessToken || !refreshToken || !expiresIn) {
        console.error('Invalid auth data received');
        return res.status(400).json({ error: 'Invalid auth data received' });
    }

    const tokens = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresIn: parseInt(expiresIn, 10),
        createdAt: Date.now()
    };

    saveTokens(tokens);
    console.log('Tokens saved successfully:', tokens);

    res.sendStatus(200);
});


module.exports = router;

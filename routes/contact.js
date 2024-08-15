const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs'); 

const API_BASE_URL = 'https://b24-89ipjl.bitrix24.vn/rest';

function getTokens() {
    if (!fs.existsSync('tokens.json')) {
        throw new Error('Tokens file not found');
    }

    const tokens = JSON.parse(fs.readFileSync('tokens.json'));
    return tokens;
}

function saveTokens(tokens) {
    fs.writeFileSync('tokens.json', JSON.stringify(tokens));
}

async function refreshToken() {
    const tokens = getTokens();
    const { refreshToken } = tokens;

    try {
        const response = await axios.post('https://oauth.bitrix.info/oauth/token/', {
            grant_type: 'refresh_token',
            client_id: 'local.66bac29f5dfd57.75552162',
            client_secret: 'ulzNiHMQ2CbiubBPK7HrU1cS3QjUnyzdFy1cFJYI21u4gFHQ5E',
            refresh_token: refreshToken
        });

        console.log('Refresh token response:', response.data);

        tokens.accessToken = response.data.access_token;
        tokens.refreshToken = response.data.refresh_token;
        tokens.expiresIn = response.data.expires_in;
        tokens.createdAt = Date.now();

        saveTokens(tokens);
        return tokens.accessToken;
    } catch (error) {
        throw new Error('Failed to refresh token: ' + error.message);
    }
}

async function getValidAccessToken() {
    let tokens = getTokens();
    const currentTime = Date.now();

    if (currentTime > tokens.createdAt + tokens.expiresIn * 1000) {
        const newAccessToken = await refreshToken();
        return newAccessToken;
    }

    return tokens.accessToken;
}

async function callAPI(method, params = {}) {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      refreshToken();
    }
    const response = await axios.get(`${API_BASE_URL}/${method}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: params
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
}

router.get('/', async (req, res) => {
  try {
    const data = await callAPI('crm.contact.list', { select: ['ID', 'NAME', 'ADDRESS', 'PHONE', 'EMAIL', 'WEB'] });
    res.render('contacts', { contacts: data.result });
  } catch (error) {
    res.status(500).send('Error fetching contacts');
  }
});

router.get('/create', (req, res) => {
    res.render('add_contact');
  });

router.post('/create', async (req, res) => {
    try {
      const { NAME, ADDRESS, PHONE, EMAIL, WEB } = req.body;

      const contactData = {
        fields: {
          NAME,
          ADDRESS,
          PHONE: [
            { VALUE: PHONE, VALUE_TYPE: 'WORK' }
          ],
          EMAIL: [
            { VALUE: EMAIL, VALUE_TYPE: 'WORK' }
          ],
          WEB: [
            { VALUE: WEB, VALUE_TYPE: 'WORK' }
          ]
        }
      };
  
      console.log('contactData:', contactData);
  
      await callAPI('crm.contact.add', contactData);
      res.redirect('/contacts');
    } catch (error) {
      console.error('Error creating contact:', error.message);
      res.status(500).send('Error creating contact');
    }
});
  
router.get('/edit/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const data = await callAPI('crm.contact.get', { id });
      const contact = data.result;
  
      const phone = contact.PHONE.map(p => p.VALUE).join(', ') || 'N/A';
      const email = contact.EMAIL.map(e => e.VALUE).join(', ') || 'N/A';
      const web = contact.WEB.map(w => w.VALUE).join(', ') || 'N/A';
  
      res.render('edit_contact', {
        ID: contact.ID,
        NAME: contact.NAME,
        ADDRESS: contact.ADDRESS || 'N/A',
        PHONE: phone,
        EMAIL: email,
        WEB: web
      });
    } catch (error) {
      res.status(500).send('Error fetching contact details');
    }
});
  

router.post('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { NAME, ADDRESS, PHONE, EMAIL, WEB} = req.body;
    await callAPI('crm.contact.update', {
      id,
      fields: {
        NAME,
        ADDRESS,
        PHONE: [
          { VALUE: PHONE, VALUE_TYPE: 'WORK' }
        ],
        EMAIL: [
          { VALUE: EMAIL, VALUE_TYPE: 'WORK' }
        ],
        WEB: [
          { VALUE: WEB, VALUE_TYPE: 'WORK' }
        ]
      }
    });
    res.redirect('/contacts');
  } catch (error) {
    res.status(500).send('Error updating contact');
  }
});

router.get('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await callAPI('crm.contact.delete', { id });
    res.redirect('/contacts');
  } catch (error) {
    res.status(500).send('Error deleting contact');
  }
});

module.exports = router;

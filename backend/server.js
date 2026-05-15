const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}


let codeVerifier = '';


app.get('/auth/login', (req, res) => {
  codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const url = `${process.env.SF_LOGIN_URL}/services/oauth2/authorize` +
    `?response_type=code` +
    `&client_id=${process.env.SF_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.SF_REDIRECT_URI)}` +
    `&code_challenge=${codeChallenge}` +
    `&code_challenge_method=S256`;

  res.redirect(url);
});


app.get('/oauth/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const response = await axios.post(
      `${process.env.SF_LOGIN_URL}/services/oauth2/token`,
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code: code,
          client_id: process.env.SF_CLIENT_ID,
          client_secret: process.env.SF_CLIENT_SECRET,
          redirect_uri: process.env.SF_REDIRECT_URI,
          code_verifier: codeVerifier,
        },
      }
    );
    const { access_token, instance_url } = response.data;
    res.redirect(
      `http://localhost:3000?token=${access_token}&instance=${encodeURIComponent(instance_url)}`
    );
  } catch (error) {
    console.error('OAuth Error:', error.response?.data || error.message);
    res.status(500).send('OAuth failed. Check your credentials.');
  }
});


app.get('/validation-rules', async (req, res) => {
  try {
    const { token, instance } = req.query;

    const response = await axios.get(
      `${instance}/services/data/v59.0/tooling/query/?q=SELECT+Id,+ValidationName,+Active+FROM+ValidationRule+WHERE+EntityDefinition.QualifiedApiName='Account'`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.json(response.data.records);

  } catch (error) {
    console.error('Fetch Rules Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch validation rules' });
  }
});


app.post('/toggle-rule', async (req, res) => {
  try {
    const { token, instance, ruleId, active } = req.body;

   
    const getResponse = await axios.get(
      `${instance}/services/data/v59.0/tooling/sobjects/ValidationRule/${ruleId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const existingMetadata = getResponse.data.Metadata;

    
    await axios.patch(
      `${instance}/services/data/v59.0/tooling/sobjects/ValidationRule/${ruleId}`,
      {
        Metadata: {
          ...existingMetadata,
          active: active,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ success: true });

  } catch (error) {
    console.error('Toggle Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to toggle rule' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
// utils/twitchTokenManager.js
const axios = require('axios');

let twitchToken = null;
let tokenExpiry = 0;

async function getTwitchToken() {
  const now = Date.now() / 1000;
  if (twitchToken && tokenExpiry > now + 60) {
    return twitchToken;
  }

  try {
    const res = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials',
      },
    });

    twitchToken = res.data.access_token;
    tokenExpiry = now + res.data.expires_in;

    return twitchToken;
  } catch (err) {
    console.error('❌ Error al refrescar el token de Twitch:', err.response?.data || err.message);
    return null;
  }
}

module.exports = { getTwitchToken };

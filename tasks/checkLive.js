const axios = require('axios');
const AnnounceChannel = require('../schemas/AnnounceChannel');
const { getTwitchToken } = require('../utils/twitchTokenManager');

module.exports = (client) => {
  setInterval(async () => {
    const registros = await AnnounceChannel.find({});

    for (const registro of registros) {
      const twitchUrl = registro.platform.Twitch?.channel;
      if (!twitchUrl) continue;

      const twitchUsername = twitchUrl.split('/').pop().toLowerCase();
      if (!twitchUsername) continue;

      const token = await getTwitchToken();
      if (!token) continue;

      try {
        const res = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${twitchUsername}`, {
          headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
          },
        });

        const isLive = res.data.data.length > 0;

        if (isLive && !registro.platform.Twitch.notificado) {
            const stream = res.data.data[0];
            const streamUrl = `https://twitch.tv/${stream.user_name}`;
            const user = await client.users.fetch(registro.discord_id).catch(() => null);
            const discordName = user ? user.username : stream.user_name;
            const embed = {
              title: stream.title,
              description: `[${discordName}](${streamUrl}) está en directo en Twitch!`,
              color: 0x9146FF,
              url: streamUrl,
              image: {
                url: stream.thumbnail_url
                  .replace('{width}', '1280')
                  .replace('{height}', '720') + `?rand=${Date.now()}`, // evita caché
              },
              author: {
                name: stream.user_name,
                url: streamUrl,
                icon_url: stream.profile_image_url
                  .replace('{width}', '70')
                  .replace('{height}', '70'),
              },
              footer: {
                text: `Visto por ${client.user.username}`,
                icon_url: client.user.displayAvatarURL(),
              },
            };

            const row = {
              type: 1, // ActionRow
              components: [
                {
                  type: 2, // Botón
                  style: 5, // Link button
                  label: '🎥 Mirar stream',
                  url: streamUrl,
                },
              ],
            };
            console.log(JSON.stringify(stream, null, 2));
            const channel = await client.channels.fetch(process.env.DISCORD_ANNOUNCE_CHANNEL_ID);
            await channel.send({
              content: '@here',
              embeds: [embed],
              components: [row],
          });


          registro.platform.Twitch.notificado = true;
          await registro.save();
        } else if (!isLive && registro.platform.Twitch.notificado) {
          console.log(`${twitchUsername} ya no está en directo. Reiniciando notificación.`);
          registro.platform.Twitch.notificado = false;
          await registro.save();
        }
      } catch (err) {
        console.error(`Error al verificar a ${twitchUsername}:`, err.response?.data || err.message);
      }
    }
  }, 60 * 1000); // cada minuto
};



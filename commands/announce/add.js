const { SlashCommandBuilder } = require('discord.js');
const AnnounceChannel = require('../../schemas/AnnounceChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce-add')
    .setDescription('Añade un canal a la base de datos para anuncios')
    .addStringOption(option =>
      option.setName('plataforma')
        .setDescription('Plataforma del canal')
        .setRequired(true)
        .addChoices(
          { name: 'Twitch', value: 'Twitch' },
          { name: 'Kick', value: 'Kick' }
        )
    )
    .addStringOption(option =>
      option.setName('url')
        .setDescription('URL del canal')
        .setRequired(true))
    .addUserOption(option =>
  option.setName('usuario')
    .setDescription('Selecciona el usuario que está añadiendo el canal')
    .setRequired(false)),

  async execute(interaction) {
    const plataforma = interaction.options.getString('plataforma');
    const url = interaction.options.getString('url');
    const user = interaction.options.getUser('usuario') || interaction.user;
    const discord_id = user.id;

    let doc = await AnnounceChannel.findOne({ discord_id });
    if (!doc) {
      doc = new AnnounceChannel({
        discord_id,
        platform: {
          Twitch: {},
          Kick: {}
        }
      });
    }

    doc.platform[plataforma] = { channel: url, notificado: false };
    await doc.save();

    await interaction.reply({ content: `✅ Canal añadido en ${plataforma}: ${url}`, ephemeral: true });
  },
};
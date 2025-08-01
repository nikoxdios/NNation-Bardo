const { SlashCommandBuilder } = require('discord.js');
const AnnounceChannel = require('../../schemas/AnnounceChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce-set')
    .setDescription('Establece el estado de notificación de un canal')
    .addStringOption(option =>
      option.setName('usuario')
        .setDescription('Selecciona el usuario')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option =>
      option.setName('plataforma')
        .setDescription('Plataforma (Twitch o Kick)')
        .setAutocomplete(true)
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('en_directo')
        .setDescription('¿Está en directo?')
        .setRequired(true)),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused(true);
    const subguild = interaction.guildId;

    const entries = await AnnounceChannel.find({});
    if (focused.name === 'usuario') {
      const choices = entries.map(e => ({
        name: e.discord_id,
        value: e.discord_id
      }));
      await interaction.respond(
        choices.filter(c => c.name.includes(focused.value)).slice(0, 25)
      );
    } else if (focused.name === 'plataforma') {
      const userId = interaction.options.getString('usuario');
      const found = entries.find(e => e.discord_id === userId);
      if (!found) return interaction.respond([]);

      const platforms = Object.keys(found.platform || {});
      const choices = platforms.map(p => ({ name: p, value: p }));
      await interaction.respond(
        choices.filter(c => c.name.toLowerCase().includes(focused.value.toLowerCase())).slice(0, 25)
      );
    }
  },

  async execute(interaction) {
    const userId = interaction.options.getString('usuario');
    const plataforma = interaction.options.getString('plataforma');
    const enDirecto = interaction.options.getBoolean('en_directo');

    const entry = await AnnounceChannel.findOne({ discord_id: userId });
    if (!entry || !entry.platform[plataforma]) {
      return interaction.reply({ content: 'No se encontró ese usuario/plataforma.', ephemeral: true });
    }

    entry.platform[plataforma].notificado = enDirecto;
    await entry.save();

    await interaction.reply({ content: `✅ Estado actualizado para ${plataforma} (${userId}) a: ${enDirecto}`, ephemeral: true });
  }
};

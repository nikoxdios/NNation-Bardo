const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  PermissionFlagsBits
} = require("discord.js");
const AnnounceChannel = require("../../schemas/AnnounceChannel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce-remove")
    .setDescription("Remueve una plataforma de un canal verificado")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option.setName("usuario")
        .setDescription("El ID del usuario que quieres modificar")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption(option =>
      option.setName("plataforma")
        .setDescription("La plataforma que quieres remover (Twitch, Kick, etc.)")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const discordId = interaction.options.getString("usuario");
    const platform = interaction.options.getString("plataforma");

    const doc = await AnnounceChannel.findOne({ discord_id: discordId });
    if (!doc) return interaction.reply({ content: "No se encontró el usuario en la base de datos.", ephemeral: true });

    if (!doc.platform || !doc.platform[platform]) {
      return interaction.reply({ content: `El usuario no tiene la plataforma ${platform}.`, ephemeral: true });
    }

    delete doc.platform[platform];

    await doc.save();
    return interaction.reply({ content: `Plataforma **${platform}** eliminada de <@${discordId}>.`, ephemeral: true });
  },

  /**
   * @param {AutocompleteInteraction} interaction
   */
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused(true);

    if (focused.name === "usuario") {
      const docs = await AnnounceChannel.find({});
      const choices = docs.map(d => ({
        name: d.discord_id,
        value: d.discord_id
      }));
      return interaction.respond(
        choices.filter(c => c.name.includes(focused.value)).slice(0, 25)
      );
    }

    if (focused.name === "plataforma") {
      const discordId = interaction.options.getString("usuario");
      const doc = await AnnounceChannel.findOne({ discord_id: discordId });
      if (!doc || !doc.platform) return interaction.respond([]);

      const platformChoices = Object.keys(doc.platform).map(p => ({ name: p, value: p }));
      return interaction.respond(
        platformChoices.filter(c => c.name.toLowerCase().includes(focused.value.toLowerCase())).slice(0, 25)
      );
    }
  },
};

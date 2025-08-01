const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { createVerifyButton } = require('../views/VerifyButtonView');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verificar')
        .setDescription('Envía el botón de verificación en un canal.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Canal donde enviar el botón')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const button = createVerifyButton();

        await channel.send({ content: '🔹 Pulsa el botón para verificarte:', components: [button] });
        await interaction.reply({ content: `✅ Botón enviado en ${channel}`, ephemeral: true });
    }
};

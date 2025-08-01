const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createVerifyButton() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('verify_button')
            .setLabel('Verificar')
            .setStyle(ButtonStyle.Success)
    );
}

module.exports = { createVerifyButton };

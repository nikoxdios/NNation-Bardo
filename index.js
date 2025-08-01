require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const commandsPath = path.join(__dirname, 'commands');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    partials: [Partials.Channel]
});

// Conexión MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'Bard',
})
.then(() => console.log('Conexión a MongoDB exitosa'))
.catch((err) => console.error('Error al conectar con MongoDB:', err));

// Cuando el bot esté listo
client.once('ready', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
  require('./tasks/checkLive')(client); // inicia el verificador
});



client.commands = new Collection();

// Cargar comandos
function loadCommandsRecursively(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadCommandsRecursively(fullPath); // Llamada recursiva
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      client.commands.set(command.data.name, command);
    }
  }
}

loadCommandsRecursively(commandsPath);


// Cargar eventos
const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(eventsPath, file));
    if (event.once) client.once(event.name, (...args) => event.execute(...args));
    else client.on(event.name, (...args) => event.execute(...args));
}

client.on('interactionCreate', async interaction => {
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (command && command.autocomplete) {
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(error);
      }
    }
  }
  // ...existing code for handling commands
});

// Manejador de interacciones (incluye botón)
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Error al ejecutar el comando.', ephemeral: true });
        }
    } else if (interaction.isButton()) {
        if (interaction.customId === 'verify_button') {
            const user = interaction.member;
            const verifiedRole = interaction.guild.roles.cache.get('845084796421668934');
            const unverifiedRole = interaction.guild.roles.cache.get('1347369247621517322');

            try {
                if (!user.roles.cache.has(verifiedRole.id)) {
                    await user.roles.add(verifiedRole, 'Usuario verificado');
                    if (unverifiedRole && user.roles.cache.has(unverifiedRole.id)) {
                        await user.roles.remove(unverifiedRole, 'Usuario verificado');
                    }
                    await interaction.reply({ content: '✅ Te has verificado con éxito.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Ya estás verificado.', ephemeral: true });
                }
            } catch (err) {
                console.error(err);
                await interaction.reply({ content: '❌ No se pudo verificar.', ephemeral: true });
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

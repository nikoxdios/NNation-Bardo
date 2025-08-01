const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

const getCommandFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });

  for (const dirent of list) {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      results = results.concat(getCommandFiles(res));
    } else if (dirent.isFile() && res.endsWith('.js')) {
      results.push(res);
    }
  }

  return results;
};

const commandFiles = getCommandFiles(commandsPath);

for (const filePath of commandFiles) {
  console.log('Cargando comando:', path.relative(__dirname, filePath));
  const command = require(filePath);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🌀 Registrando comandos...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Comandos registrados');
  } catch (err) {
    console.error('❌ Error al registrar comandos:', err);
  }
})();

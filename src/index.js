const { Client, GatewayIntentBits, Collection, Partials } = require(`discord.js`);
const fs = require('fs');
const path = require('path');
const client = new Client({ intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions], partials: [Partials.Channel, Partials.Message, Partials.Reaction] });

client.commands = new Collection();

require('dotenv').config();

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleGlobalCommands(commandFolders, "./src/commands");

    try {
        const directoryPath = path.join(__dirname, '../config/');
        const files = fs.readdirSync(directoryPath);

        const guildFolders = files.filter(file => {
            return fs.statSync(path.join(directoryPath, file)).isDirectory(); // Check if it's a directory
        });

        for (const guildId of guildFolders) {
            if (guildId == 'user_creations') continue;
            client.handleGuildCommands(commandFolders, "./src/commands", guildId);
        }
    } catch {
        console.error("no guilds founds?");
    }   
    client.login(process.env.token); 
})();
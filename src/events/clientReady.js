const { readJSON, writeJSON } = require("../misc/ReadWriteJSON");
const { checkCards } = require('../misc/CheckCards');
module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        try { // I'm scared of crashes ):
            let config = await readJSON("config.json");
            if (!config) {
                config = {
                    "message_channels": {
                        "CHANNEL_ID": "SERVER_ID"
                    },
                    "show_old_listings_on_startup": false
                };
                writeJSON(config, "config.json");
            }

            let guildExists = false, channelexists = false;
            for (const channelId of Object.keys(config.message_channels)) {
                const guild = client.guilds.cache.get(config.message_channels[channelId]);
                if (!guild) {
                    continue;
                }
                guildExists = true;

                const channel = guild.channels.cache.get(channelId);

                if (channel) {
                    channelexists = true;
                }
            }

            if (!guildExists) {
                const clientId = client.user.id;
                console.warn("No valid guilds found in config.json! You can still get notifications via DMs, but please add a valid guild ID and channel ID and restart the bot to get messages for all cards.\nIf the server id is correct, and the bot has not yet been added to the server, please add it with this link:\nhttps://discord.com/oauth2/authorize?client_id=" + clientId + "&permissions=274877908992&integration_type=0&scope=bot.");
            } else if (!channelexists) {
                console.warn("No valid channels found in config.json! You can still get notifications via DMs, add a valid channel ID and restart the bot to get messages for all cards.");
            }

            console.log("Logged in as: " + client.user.tag); // send log in message to console

            let cardsJSON = await readJSON("cards.json");
            if (!cardsJSON) {
                cardsJSON = {};
                await writeJSON(cardsJSON, "cards.json");
            }
            checkCards(client);
            client.user.setPresence({
                activities: [
                    { name: "Watching for new listings", type: 3 } // type 0 = Playing
                ],
                status: "idle" // can be 'online', 'idle', 'dnd', or 'invisible'
            });
        } catch (error) {
            console.error(error);
        }
    }
};
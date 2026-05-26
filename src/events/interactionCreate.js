const { InteractionType, MessageFlags, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

const { readJSON, writeJSON } = require('../misc/ReadWriteJSON.js');
const { embedBuilder } = require('../misc/MessageTools.js');
const { updateCardList } = require('../misc/CheckCards.js');


module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            if (interaction.isButton()) { // button interactions
                // return error if it isn't your menu lol
                if (interaction.message.interaction) {
                    if (interaction.message.interaction.user.id != interaction.user.id) return interaction.reply({ embeds: [embedBuilder("⚠️ Error", "That isn't your interaction", "#b01710")], flags: [MessageFlags.Ephemeral] });
                } else if (interaction.message.reference) {
                    let interactionMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
                    if (interactionMessage.interaction.user.id != interaction.user.id) return interaction.reply({ embeds: [embedBuilder("⚠️ Error", "That isn't your interaction", "#b01710")], flags: [MessageFlags.Ephemeral] });
                }

            } else if (interaction.isStringSelectMenu()) {
                if (interaction.customId === 'delete_card') {
                    const selected = interaction.values[0];

                    let cards = readJSON("cards.json");

                    if (cards[selected]) {
                        delete cards[selected];
                        writeJSON(cards, "cards.json");
                        interaction.message.edit({ components: [], embeds: [embedBuilder("Card removed from list", "Card successfully removed from the watch list.", "success")] });
                        interaction.deferUpdate();
                        updateCardList();
                    } else {
                        interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [embedBuilder("⚠️ Error ⚠️", "That card has already been removed or is not on the current watch list.", "error")] });
                    }
                } else if (interaction.customId === "edit_notify") {
                    interaction.message.delete();
                    const selected = interaction.values[0];

                    let cards = readJSON("cards.json");

                    if (cards[selected]) {
                        const title = "Get notified for " + cards[selected].name
                        const modal = new ModalBuilder()
                            .setCustomId('nedit-' + selected)
                            .setTitle(title.slice(0, 45));

                        const pingPriceInput = new TextInputBuilder()
                            .setCustomId('ping_price')
                            .setLabel("Maximum Price")
                            .setPlaceholder("If left blank, will ping for any new listings")
                            .setRequired(false)
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(25)
                        let actionRow = new ActionRowBuilder().addComponents(pingPriceInput);
                        modal.addComponents(actionRow);

                        const dmBoolean = new TextInputBuilder()
                            .setCustomId('dm_bool')
                            .setLabel("DM instead of ping?")
                            .setPlaceholder("Choose \"Yes\" or \"No\", default: No")
                            .setRequired(false)
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(3)
                        actionRow = new ActionRowBuilder().addComponents(dmBoolean);
                        modal.addComponents(actionRow);

                        // answer command with the modal
                        await interaction.showModal(modal);
                    }

                }

            } else if (interaction.isModalSubmit()) {
                let modalId = interaction.customId;
                const userId = interaction.user.id;
                let args = modalId.split("-");

                if (modalId == "add_card") {
                    let cardsJSON = await readJSON("cards.json");
                    const cardName = interaction.fields.getTextInputValue('card_name');
                    const cardID = interaction.fields.getTextInputValue('card_id');
                    const cardLink = interaction.fields.getTextInputValue('card_link');
                    const pingPrice = interaction.fields.getTextInputValue('ping_price') ? interaction.fields.getTextInputValue('ping_price') : 0;
                    const dmBoolInput = interaction.fields.getTextInputValue('dm_bool');
                    const dmBool = dmBoolInput.toLowerCase() == "yes";

                    if (cardsJSON[cardID]) return interaction.reply({ ephemeral: true, embeds: [embedBuilder("⚠️ Error ⚠️", "That card id is already in the list to watch", "error")] });
                    cardsJSON[cardID] = {
                        name: cardName,
                        link: cardLink ? cardLink : "https://www.tcgplayer.com/product/" + cardID,
                        pingPrice: {
                            [userId]: {
                                "price": pingPrice,
                                "dm": dmBool
                            }
                        }
                    }
                    writeJSON(cardsJSON, "cards.json");
                    interaction.reply({ embeds: [embedBuilder("Card added", `${cardName}(${cardID}) was added to the watch list`, "success")] });
                    updateCardList();
                } else if (args[0] == "nedit") {
                    const pingPrice = interaction.fields.getTextInputValue('ping_price') ? interaction.fields.getTextInputValue('ping_price') : 0;
                    const dmBoolInput = interaction.fields.getTextInputValue('dm_bool');
                    const dmBool = dmBoolInput.toLowerCase() == "yes";
                    const cardId = args[1];
                    let cardsJSON = await readJSON("cards.json");

                    if (cardsJSON[cardId]) {
                        cardsJSON[cardId].pingPrice[interaction.user.id] = {
                            "price": pingPrice,
                            "dm": dmBool
                        }
                        writeJSON(cardsJSON, "cards.json");
                        await interaction.reply({flags: MessageFlags.Ephemeral, embeds: [embedBuilder("Changes recorded.", "You will now be " + (dmBool ? "dm'd" : "pinged") + " when a new listing is found for " + cardsJSON[cardId].name, "success")]})
                        updateCardList();
                    } else {
                        interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [embedBuilder("⚠️ Error ⚠️", "That card has already been removed or is not on the current watch list.", "error")] });
                    }

                }
            } else if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;

                // send autocomplete to the command
                try {
                    await command.autocomplete(interaction, client);
                } catch (error) {
                    console.error(error);
                }
            } else {
                if (!interaction.isCommand()) return;

                const command = client.commands.get(interaction.commandName);

                if (!command) return

                try {
                    // send to command
                    await command.execute(interaction, client);
                } catch (error) {
                    console.error(error);
                    try {
                        await interaction.editReply({ embeds: [embedBuilder('⚠ Error', error, "#b01710")] });
                    } catch {
                        await interaction.reply({ embeds: [embedBuilder('⚠ Error', error, "#b01710")] });
                    }
                }
            }

        } catch (err) {
            console.error(err);
        }
    }
};
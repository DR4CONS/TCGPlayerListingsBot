const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js")
const { readJSON } = require('../../misc/ReadWriteJSON');
const { embedBuilder } = require('../../misc/MessageTools');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("notify")
        .setDescription("commands for notifying for new card listings")
        .addSubcommand(subcommand =>
            subcommand.setName('edit')
                .setDescription("Either get notified for a card, or edit the method of notification/price to be notified for")
        )
        .setContexts([0, 1, 2])
        .setIntegrationTypes([1]),
    global: true,
    async execute(interaction) {
        let cards = readJSON("cards.json");

        let cardsOptions = [];
        for (const cardId of Object.keys(cards)) {
            const cardName = cards[cardId].name;
            cardsOptions.push({
                label: cardName.length > 100 ? cardName.slice(0, 100) : cardName,
                description: cardId,
                value: cardId
            });
        }
        const cardSelector = new StringSelectMenuBuilder()
            .setCustomId('edit_notify')
            .setPlaceholder('Get Notified')
            .addOptions(cardsOptions);

        const row = new ActionRowBuilder().addComponents(cardSelector);

        await interaction.reply({ embeds: [embedBuilder("Get notified for a card's new listings", "Select a card from the dropdown to edit/create settings to get notified.")], components: [row]});

    }
}
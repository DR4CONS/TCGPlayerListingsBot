const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js")
const { readJSON } = require('../../misc/ReadWriteJSON');
const { embedBuilder } = require('../../misc/MessageTools');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("removes a card")
        .addSubcommand(subcommand =>
            subcommand.setName('card')
                .setDescription("Add a card to be tracked")
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
            .setCustomId('delete_card')
            .setPlaceholder('Delete Card')
            .addOptions(cardsOptions);

        const row = new ActionRowBuilder().addComponents(cardSelector);

        await interaction.reply({embeds: [embedBuilder("Delete a card watch", "Select a card from the dropdown, the card you select will be deleted.")], components: [row]});
    }
}

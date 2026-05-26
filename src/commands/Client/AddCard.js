const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add")
        .setDescription("Adds a card")
        .addSubcommand(subcommand =>
            subcommand.setName('card')
                .setDescription("Add a card to be tracked")
        )
        .setContexts([0, 1, 2])
        .setIntegrationTypes([1]),
    global: true,
    async execute(interaction) {

        const modal = new ModalBuilder()
            .setCustomId('add_card')
            .setTitle("Add a card to be tracked")

        // text input for template title
        const cardNameInput = new TextInputBuilder()
            .setCustomId('card_name')
            .setLabel("Card Name")
            .setPlaceholder("EX: Charizard 151 SIR")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(45)
        let actionRow = new ActionRowBuilder().addComponents(cardNameInput);
        modal.addComponents(actionRow)

        // text imput for template id
        const cardIdInput = new TextInputBuilder()
            .setCustomId('card_id')
            .setLabel("Card ID")
            .setPlaceholder("EX: 476013")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(10)
        actionRow = new ActionRowBuilder().addComponents(cardIdInput);
        modal.addComponents(actionRow);

        const cardLinkInput = new TextInputBuilder()
            .setCustomId('card_link')
            .setLabel("Card Link")
            .setPlaceholder("if left blank, will use \"https://www.tcgplayer.com/product/CARD_ID\"")
            .setRequired(false)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(25)
        actionRow = new ActionRowBuilder().addComponents(cardLinkInput);
        modal.addComponents(actionRow);

        const pingPriceInput = new TextInputBuilder()
            .setCustomId('ping_price')
            .setLabel("Maximum Price")
            .setPlaceholder("If left blank, will ping for any new listings")
            .setRequired(false)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(25)
        actionRow = new ActionRowBuilder().addComponents(pingPriceInput);
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

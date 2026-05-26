const { EmbedBuilder } = require('discord.js');

function embedBuilder(title, description = "", color = "#bdbdd5", fields = [], footer = "", iconURL = "https://cdn.discordapp.com/avatars/1345825820165279805/a2f9ad7668a45df0cfd34fd8e4ebd123.png?size=2048") {
    const selectedColor = color == "error" ? "#fc0303" : color == "success" ? "#56fc03" : color == "caution" ? "#fcce03" : color; // ⚠️
    
    let embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(selectedColor)
        .addFields(fields)

    if (footer != "") embed.setFooter({
        text: footer,
        iconURL: iconURL
    });

    return embed;
}

module.exports = {
    embedBuilder
}
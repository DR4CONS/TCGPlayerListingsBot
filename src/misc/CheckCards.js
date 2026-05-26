const fetch = require("node-fetch");
const { readJSON } = require('./ReadWriteJSON');

let cards, config = readJSON("config.json");

let updateCards = 0

let firstRun = true;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let seen = new Set();

function updateCardList() {
    updateCards = 1;
}

async function checkCards(client) {
    cards = readJSON("cards.json");
    console.log("Starting the watch");
    while (true) {
        if (updateCards != 0) {
            updateCards = 0;
            cards = await readJSON("cards.json");
            config = await readJSON("config.json");
            console.log("updating cards");
        }
        let timings = generateNumbers(Object.keys(cards).length);
        let loopCount = 0
        for (const card of Object.keys(cards)) {
            await checkListings(client, cards[card].name, card, cards[card].link, cards[card]);
            await sleep(timings[loopCount++] * 1000);
        }
        firstRun = false;
    }
}


async function safeFetch(url, options, retries = 3) {
    try {
        return await fetch(url, options);
    } catch (err) {
        if (retries > 0 && err.code === "ECONNRESET") {
            console.log("Retrying after ECONNRESET...");
            await sleep(2000);
            return safeFetch(url, options, retries - 1);
        }
        throw err;
    }
}


async function checkListings(client, productName, productId, productURL) {
    try {
        const res = await safeFetch(
            "https://mp-search-api.tcgplayer.com/v1/search/request",
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "user-agent": "Mozilla/5.0",
                    "origin": "https://www.tcgplayer.com",
                    "referer": productURL
                },
                body: JSON.stringify({
                    filters: {
                        term: {
                            productId: [productId]
                        }
                    },
                    from: 0,
                    size: 50,
                    sort: {}
                })
            }
        );

        const json = await res.json();

        const listings =
            json?.results?.[0]?.results?.[0]?.listings || [];

        for (const listing of listings) {
            const key = `${listing.listingId}-${listing.price}-${listing.quantity}`;

            if (!seen.has(key)) {

                // remove old entry for same listingId
                for (const item of seen) {
                    if (item.startsWith(`${listing.listingId}-`)) {
                        seen.delete(item);
                        break;
                    }
                }

                seen.add(key);

                const imageURL = `https://tcgplayer-cdn.tcgplayer.com/product/${productId}_in_1000x1000.jpg`;
                let message = {content: ""};
                let dmUsers = [];
                let averageCost = (listing.price * listing.quantity + listing.shippingPrice) / listing.quantity;
                let pings = cards[productId].pingPrice
                if (!firstRun) {
                    for (const userId of Object.keys(pings)) if (pings[userId].price > averageCost || pings[userId].price == 0) {
                        if (pings[userId].dm) {
                            dmUsers.push(userId);
                        } else {
                            message.content += `<@${userId}>`
                        }
                    }
                }
                // message.content += pings[userId].dm ? "" : ? `<@${userId}>` : "" ;
                // let message = firstRun == true ? {} : maxPrice > 0 ? ((listing.price * listing.quantity + listing.shippingPrice) / listing.quantity <= maxPrice ? { content: "<@558440155397095455>" } : {}) : { content: "<@558440155397095455>" }

                let embedInfo = [
                    {
                        title: "New TCGplayer Listing",
                        url: productURL,
                        color: 5763719,
                        fields: [
                            {
                                name: "Card Name",
                                value: productName,
                                inline: true
                            },
                            {
                                name: "Seller",
                                value: listing.sellerName,
                                inline: true
                            },
                            {
                                name: "Price",
                                value: `$${listing.price}`,
                                inline: true
                            },
                            {
                                name: "Shipping",
                                value: `$${listing.shippingPrice || 0}`,
                                inline: true
                            },
                            {
                                name: "Quantity",
                                value: `${listing.quantity} (Average Price: ${(listing.price * listing.quantity + listing.shippingPrice) / listing.quantity})`,
                                inline: true
                            },
                            {
                                name: "Condition",
                                value: listing.condition,
                                inline: true
                            }
                        ],
                        image: {
                            url: imageURL
                        }
                    }
                ]
                message.embeds = embedInfo
                for (const user of dmUsers) {
                    const userObject = await client.users.fetch(user);
                    userObject.send({ embeds: embedInfo });
                }

                if (!firstRun || config.show_old_listings_on_startup) {
                    for (const channelId of Object.keys(config.message_channels)) {
                        const guild = await client.guilds.fetch(config.message_channels[channelId]);
                        const channel = await guild.channels.fetch(channelId);
                        if (channel.isTextBased()) await channel.send(message)
                    }
                }

                console.log("New listing:", productId, listing.price, listing.sellerName);
            }
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

function generateNumbers(x) {
    const total = 60;
    const avg = total / x;
    const min = avg * 0.9;
    const max = avg * 1.1;

    const nums = [];
    let sum = 0;

    for (let i = 0; i < x - 1; i++) {
        const remaining = total - sum;
        const remainingSlots = x - i;

        // adjust bounds so we don't break the final constraint
        const currentMin = Math.max(min, remaining - max * (remainingSlots - 1));
        const currentMax = Math.min(max, remaining - min * (remainingSlots - 1));

        const value = Math.random() * (currentMax - currentMin) + currentMin;

        nums.push(value);
        sum += value;
    }

    // last number ensures total = 60
    nums.push(total - sum);

    return nums;
}

module.exports = {
    updateCardList,
    checkCards
}
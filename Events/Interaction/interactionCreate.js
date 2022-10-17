let menuCache = {};
setInterval(menuCacheClean, 14400 * 1000);
async function menuCacheClean() {
    console.log("menuCache size " + Object.keys(menuCache).length);
    for (iii in menuCache) {
        if (menuCache[iii].timestamp < (Math.floor(Date.now() / 1000) - 14400)) delete menuCache[iii];
    }
};
const awayBoard = require('../../awayBoard.js');
const {
    ActivityType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SelectMenuBuilder
} = require('discord.js');
const timeButtons = [];
timeButtons[0] = new ActionRowBuilder()
    .addComponents(
        new SelectMenuBuilder()
        .setCustomId('hours')
        .setPlaceholder('How many hours ago?')
        .addOptions({
            label: '0',
            value: '0',
        }, {
            label: '1',
            value: '1',
        }, {
            label: '2',
            value: '2',
        }, {
            label: '3',
            value: '3',
        }, {
            label: '4',
            value: '4',
        }, {
            label: '5',
            value: '5',
        }, {
            label: '6',
            value: '6',
        }, {
            label: '7',
            value: '7',
        }, {
            label: '8',
            value: '8',
        }, {
            label: '9',
            value: '9',
        }, {
            label: '10',
            value: '10',
        }, {
            label: '11',
            value: '11',
        }, {
            label: '12',
            value: '12',
        }, {
            label: '13',
            value: '13',
        }, {
            label: '14',
            value: '14',
        }, {
            label: '15',
            value: '15',
        }, {
            label: '16',
            value: '16',
        }, {
            label: '17',
            value: '17',
        })
    );
timeButtons[1] = new ActionRowBuilder()
    .addComponents(
        new SelectMenuBuilder()
        .setCustomId('minutes')
        .setPlaceholder('How many minutes ago?')
        .addOptions({
            label: '0m/.0h',
            value: '0',
        }, {
            label: '5m/.08h.',
            value: '5',
        }, {
            label: '10m/.17h',
            value: '10',
        }, {
            label: '15m/.25h',
            value: '15',
        }, {
            label: '20m/.33h',
            value: '20',
        }, {
            label: '25m/.42h',
            value: '25',
        }, {
            label: '30m/.5h',
            value: '30',
        }, {
            label: '35m/.58h',
            value: '35',
        }, {
            label: '40m/.67h',
            value: '40',
        }, {
            label: '45m/.75h',
            value: '45',
        }, {
            label: '50m/.83h',
            value: '50',
        }, {
            label: '55m/.92h',
            value: '55',
        })
    );
module.exports = async (client, interaction) => {
    if (!interaction.isCommand() && !interaction.isContextMenuCommand() && !interaction.isButton() && !interaction.isAutocomplete() && !interaction.isSelectMenu()) return; // When the interaction is not a command, not a contextmenu, or not a button, it will not execute.
    if (interaction.isSelectMenu()) {
        if (menuCache.hasOwnProperty(interaction.message.id)) {
            menuCache[interaction.message.id][interaction.customId] = interaction.values[0];
        } else {
            menuCache[interaction.message.id] = [];
            menuCache[interaction.message.id][interaction.customId] = interaction.values[0];
            menuCache[interaction.message.id].timeStamp = Math.floor(Date.now() / 1000);
        };
        //console.log(menuCache[interaction.message.id]);
        interaction.deferUpdate();
        return;
    };
    if (interaction.isButton()) {
        let afkId = interaction.customId;
        if (menuCache[interaction.message.id] && menuCache[interaction.message.id].hasOwnProperty('ship')) afkId = menuCache[interaction.message.id].ship; //if this is the second time around, we have a cache.
        const button = awayBoard.myEmojis[afkId];
        let posted = false;
        const wsRole = await awayBoard.db.prepare('SELECT mRoleId FROM channels WHERE guild = ? AND channelId = ?').get(interaction.guildId, interaction.channelId);
        const whiteStar = await awayBoard.db.prepare('SELECT * FROM whiteStar WHERE guild = ? AND mRoleId = ?').get(interaction.guildId, wsRole.mRoleId);
console.log(interaction.customId);
        switch (interaction.customId) {
            case 'Work':
                afkBreak();
                break;
            case 'Sleep':
                afkBreak();
                break;
            case 'Battleship':
                destroyedShip();
                break;
            case 'Squishie':
                destroyedShip();
                break;
            case 'Flagship':
                flagship();
                break;
            case 'RelicDrone':
                afkBreak();
                break;
            case 'EnemyBattleship':
                destroyedShip(true);
                break;
            case 'EnemySquishie':
                destroyedShip(true);
                break;
            case 'EnemyFlagship':
                flagship();
                break;
            case 'WasteBasket':
                printTimers();
                break;
            case 'Cancel':
                ackTimers(true);
                break;
            case 'Delete':
                ackTimers();
                break;
            default: //figure out if it is opponent or ally
                whichShip();
                break;
        };
        async function ackTimers(cancelled) {
            if (cancelled) {
                interaction.update({
                    content: "OK.",
                    components: []
                }).catch(console.log);
            } else {
                if (menuCache[interaction.message.id] != undefined) {
                    await awayBoard.db.prepare('DELETE FROM awayTimers WHERE guild = ? AND mRoleId = ? AND lifeTime = ? AND fromWho = ?')
                        .run(interaction.guildId, wsRole.mRoleId, String(menuCache[interaction.message.id].afkMessage).split('.')[1], interaction.user.id);
                    awayBoard.makeAwayBoard(interaction.guild, wsRole.mRoleId, posted);
                    interaction.update({
                        content: "OK.",
                        components: []
                    }).catch(console.log);
                } else {
                    interaction.update({
                        content: "Error, no message selected.",
                        components: []
                    }).catch(console.log);
                }
            };
            if (menuCache.hasOwnProperty(interaction.message.id)) delete menuCache[interaction.message.id];
        };

        async function printTimers() {
            const awayTimers = await awayBoard.db.prepare('SELECT what,lifeTime FROM awayTimers WHERE guild = ? AND mRoleId = ? AND (who = ? OR fromWho = ?)').all(interaction.guildId, wsRole.mRoleId, interaction.user.id, interaction.user.id);
           // console.log(awayTimers); //figure out what empty looks like
            if (awayTimers.length < 1) {
                interaction.reply({
                    content: "No messages available.",
                    components: [],
                    ephemeral: true
                }).catch(console.log);
            }
            const curTime = Math.floor(Date.now() / 1000);
            let dropDown = [];
            for (xa in awayTimers) {
                const t = ((awayTimers[xa].lifeTime - curTime) / 3600);
                let time;
                if (t < 1)
                    time = String(Math.floor(t * 60) + "m").padEnd(5,'⠀');
                else
                    time = String(Math.floor(t * 10) / 10 + "h").padEnd(5,'⠀');;
                    if(time.indexOf(".") > -1) time += '⠀';
                dropDown.push({
                    label: String(time + awayTimers[xa].what).replace(/<:(\w+):\d+>/g, "$1"),
                    value: String(xa + ".") + String(awayTimers[xa].lifeTime) //added the xa+"." to prevent the odd time that two messages have the same lifeTime and cause a bot crash.
                })
            };
            let selectMenu = [];
            selectMenu[0] = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                    .setCustomId('afkMessage')
                    .setPlaceholder('Select afk?')
                    .addOptions(...dropDown));
            selectMenu[1] = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("Delete")
                    .setLabel("Delete")
                    .setStyle(4), //4 is red
                )
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("Cancel")
                    .setLabel("Cancel")
                    .setStyle(2), //4 is red
                );
            interaction.reply({
                components: selectMenu,
                ephemeral: true
            }).catch(console.log);
        };

        async function whichShip() {
            let who, what;
            if (!menuCache[interaction.message.id]) {
                interaction.update({
                    content: 'A strange error has occured.',
                    ephemeral: true,
                    components: []
                });
                return; //catch
            };
            if (interaction.customId == 'OK') {
                if (button.id == awayBoard.myEmojis.EnemyFlagship.id) {
                    who = '0'
                    what = button.inline;
                } else {
                    who = '10'
                    what = "<@&" + wsRole.mRoleId + ">⠀⠀" + button.inline;
                }
            } else {
                const opponents = await JSON.parse(whiteStar.opponents);
                if (!!opponents[Number(interaction.customId)]) {
                    who = '0';
                    what = button.inline + " " + opponents[interaction.customId];
                } else { //otherwise friendly *** add an extra check here for later to ensure userid.
                    who = interaction.customId;
                    what = button.inline;
                };
            };
            const lifeTime = Math.floor((Date.now() / 1000) + button.time - ((menuCache[interaction.message.id].hours * 3600) + (menuCache[interaction.message.id].minutes * 60)));
            await awayBoard.db.prepare('DELETE FROM awayTimers WHERE guild = ? AND mRoleId = ? AND what = ? AND who = ?')
                .run(interaction.guildId, wsRole.mRoleId, what, who); //remove previous versions if they exist, we overwrite with the new one technically.
            await awayBoard.db.prepare('INSERT INTO awayTimers (guild, mRoleId, lifeTime, what, who, fromwho) VALUES(?,?,?,?,?,?)').run(interaction.guildId, wsRole.mRoleId, lifeTime, what, who, interaction.user.id);
            interaction.update({
                content: "OK.",
                components: []
            }).catch(console.log);
            delete menuCache[interaction.message.id];
            awayBoard.makeAwayBoard(interaction.guild, wsRole.mRoleId, posted);
        };

        async function destroyedShip(enemy) {
            let menuButtons = [];
            if (enemy) {
                const opponents = await JSON.parse(whiteStar.opponents);
                if (opponents.length < 1) { //do something if the opponents list is not populated yet. alert to it?
                    interaction.reply({
                        content: "Error, please setup the opponents first. **/ws opponents**",
                        components: []
                    }).catch(console.log);
                    return;
                } else
                    for (nCount = 0; nCount < opponents.length; nCount++) {
                        if (nCount > 15) {
                            break;
                        }
                        const r = Math.floor(nCount / 5);
                        if (!menuButtons[r]) {
                            menuButtons[r] = new ActionRowBuilder();
                        }
                        menuButtons[r].addComponents(
                            new ButtonBuilder()
                            .setCustomId(String(nCount))
                            .setLabel(String(opponents[nCount]).slice(0, 20))
                            .setStyle(4), //4 is red
                        );
                    };
            } else {
                //friendly 
                const mRoleId = await interaction.guild.roles.cache.get(wsRole.mRoleId);
                let nCount = 0;
                const tagCheck = new RegExp(/\[[\s\S]*\](.*)$/i); //remove corp tags
                for (const [key, value] of mRoleId.members) {
                    nCount++;
                    if (nCount > 15) {
                        break;
                    }
                    let displayName = String(value.displayName);
                    if (!!tagCheck.test(displayName)) {
                        let displayNameTest = displayName.match(tagCheck);
                        if (displayNameTest.length == 2)
                            if (displayNameTest[1].length > 4) displayName = displayNameTest[1];
                    };
                    displayName = displayName.slice(0, 20);
                    console.log("3" + displayName)
                    const r = Math.floor(nCount / 5);
                    if (!menuButtons[r]) {
                        menuButtons[r] = new ActionRowBuilder();
                    }
                    menuButtons[r].addComponents(
                        new ButtonBuilder()
                        .setCustomId(value.id)
                        .setLabel(displayName)
                        .setStyle(1), //1 is blue
                    )
                };
            };
            menuButtons = timeButtons.concat(menuButtons); //Put the drop down menus first.
            const message = await interaction.reply({
                ephemeral: true,
                fetchReply: true,
                components: menuButtons
            });
            menuCache[message.id] = {
                hours: 0,
                minutes: 0,
                timeStamp: Math.floor(Date.now() / 1000),
                ship: interaction.customId,
            };
            awayBoard.makeAwayBoard(interaction.guild, wsRole.mRoleId, posted);
        };

        async function flagship(enemy) {
            let who = '10';
            let bStyle = 1;
            if (enemy) {
                who = '0';
                bStyle = 4; //4 is red
            };
            let menuButtons = [];
            menuButtons[0] = new ActionRowBuilder();
            menuButtons[0].addComponents(
                new ButtonBuilder()
                .setCustomId("OK")
                .setLabel("OK")
                .setStyle(bStyle)
            );
            menuButtons = timeButtons.concat(menuButtons); //Put the drop down menus first.
            const message = await interaction.reply({
                ephemeral: true,
                fetchReply: true,
                components: menuButtons
            });
            menuCache[message.id] = {
                hours: 0,
                minutes: 0,
                timeStamp: Math.floor(Date.now() / 1000),
                ship: interaction.customId,
            };
        };

        async function afkBreak() {
            const checkEntry = await awayBoard.db.prepare('SELECT * FROM awayTimers WHERE guild = ? AND mRoleId = ? AND what = ? AND who = ?').get(interaction.guildId, wsRole.mRoleId, button.inline, interaction.user.id);
            if (!checkEntry) {
                interaction.deferUpdate();
                await awayBoard.db.prepare('INSERT INTO awayTimers (guild, mRoleId, lifeTime, what, who, fromWho) VALUES(?,?,?,?,?,?)')
                    .run(interaction.guildId, wsRole.mRoleId, Math.floor(Date.now() / 1000 + button.time), button.inline, interaction.user.id, interaction.user.id);
            } else {
                posted = true
                await interaction.channel.send({
                    content: " <@" + interaction.user.id + "> " + checkEntry.what + " " + button.past,
                    allowedMentions: {
                        parse: ['users', 'roles']
                    },
                    ephemeral: false
                });
                await awayBoard.db.prepare('DELETE FROM awayTimers WHERE guild = ? AND mRoleId = ? AND what = ? AND who = ? AND fromWho = ?')
                    .run(interaction.guildId, wsRole.mRoleId, button.inline, interaction.user.id, interaction.user.id);
            };
            awayBoard.makeAwayBoard(interaction.guild, wsRole.mRoleId, posted);
        };
    };
    if (interaction.isCommand() || interaction.isContextMenuCommand() || interaction.isAutocomplete()) { // If the command is a command or an contextmenu, it will run the below code.
        const command = client.commands.get(interaction.commandName) // This is the command (It's the same for ContextMenu as a ContextMenuCommand is just the same as a slash command, only the difference is that ContextMenuCommands are ran through an User Interface.
        if (!command) return // If the command does not exists, return again.
        try {
            await command.execute(interaction) // Try to execute the command.
        } catch (err) {
            if (err) console.error(err) // If it fails, it returns an error.
            await interaction.reply({ // And you inform the users that you have found an error.
                content: "You found an error!",
                ephemeral: true
            })
        }
    }
}

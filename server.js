require('dotenv').config();
const Discord = require('discord.js');

const CommandHandler = require('./CommandHandler.js');

const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages] });
const rest = new Discord.REST({ version: '10' }).setToken(process.env.TOKEN);

const ch = new CommandHandler();
ch.genCommandList();

client.once(Discord.Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);

    ch.init(rest, client.application.id);

    client.commands = new Discord.Collection();
    ch.orig_commands.forEach(cmd => {
        client.commands.set(cmd.data.name, cmd);
    })
});

client.login(process.env.TOKEN);

client.on('messageCreate', msg => {
    // console.log(msg);
});

client.on(Discord.Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});
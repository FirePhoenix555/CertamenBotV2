const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');

class CommandHandler {
    constructor() {
        this.commands = [];
        this.orig_commands = [];
    }

    genCommandList(cmdPath="commands") {
        let commandsPath = path.join(__dirname, cmdPath);
        let commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
        for (let file of commandFiles) {
            let cmd = require(`./${cmdPath}/${file}`);
            this.orig_commands.push(cmd);
            this.commands.push(cmd.data.toJSON());
        
            if (!('data' in cmd && 'execute' in cmd)) {
                console.log(`[WARNING] The command ${(cmd.data && cmd.data.name) ? cmd.data.name : "[undefined]"} is missing a required "data" or "execute" property.`);
            }
        }
    }

    async init(rest, clientID) {
        try {
            console.log(`Started refreshing ${this.commands.length} application (/) commands.`);
            
            const data = await rest.put(
                Discord.Routes.applicationCommands(clientID),
                { body: this.commands },
            );
    
            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = CommandHandler;
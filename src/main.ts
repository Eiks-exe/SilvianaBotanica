import { Client, GatewayIntentBits, GuildMember, IntentsBitField } from "discord.js"
import * as dotenv from 'dotenv'
import Controller from "./Controllers/CommandController"
import { readdirSync } from "fs"
import { ICommand } from "./Interfaces/commands"
import { onVoiceStateUpdate } from "./tableManager"

dotenv.config()

const main = async (): Promise<void> => {

    let controller: Controller<ICommand> | undefined
    const myIntents = new IntentsBitField();
    myIntents.add(
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
        );
    const client = new Client({ intents: myIntents })
    client.on("ready", () => {
        console.log(`Logged in as ${client.user?.tag}!`);
        controller = client?.user?.id ? new Controller(client, client.user.id) : undefined;
        const extensionFile = readdirSync('./src/Extensions', {withFileTypes: true}).filter(file => file.isDirectory())
        extensionFile.forEach(async  (file) => {
            const extension = await import(`./Extensions/${file.name}`)
            controller?.Plug(extension.default)
        })

    })

    client.on('messageCreate', async message => {
       controller?.execute(message)
    })

    client.on('interactionCreate', async interaction => {
      if (interaction.isChatInputCommand()) {
        controller?.executeSlash(interaction)
      } else if (interaction.isButton() && !interaction.isModalSubmit() && !interaction.isUserSelectMenu()){
        switch(interaction.customId){
          case 'invite_guest':
            return console.log("invite guest requested")
        }
      }
    })
    
    client.on('voiceStateUpdate', async (oldState, newState) => {
      console.log("voiceStateUpdate")
      onVoiceStateUpdate(oldState,newState);
    })


    client.login(process.env.TOKEN)
}

main()

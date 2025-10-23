import { Client, GatewayIntentBits, IntentsBitField } from "discord.js"
import * as dotenv from 'dotenv'
import Controller from "./Controllers/CommandController"
import { readdirSync } from "fs"
import { ICommand } from "./Interfaces/commands"
import { onVoiceStateUpdate } from "./Controllers/TableController"
import { handleInviteGuestInteraction, inviteGuestMenuInteraction, setTablePrivacy, setUserLimit, tableSettingsInteraction, setPrivacyInteraction, closeTableInteraction } from "./Controllers/TableController/tableManager"

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
          case 'invite_guests':
            return handleInviteGuestInteraction(interaction)
          case 'adjust_seats':
            return tableSettingsInteraction(interaction)
          case 'privacy':
            return setPrivacyInteraction(interaction)
          case 'close_table':
            return closeTableInteraction(interaction)
        }
      } else if (interaction.isUserSelectMenu() && interaction.customId == "select_guest") {
        console.log("usermenu")
        inviteGuestMenuInteraction(interaction);
      } else if (interaction.isStringSelectMenu()) {
        switch(interaction.customId){
          case 'user_limit_select':
            console.log("userlimitselectcalled")
            setUserLimit(interaction)
          case 'privacy_settings':
            setTablePrivacy(interaction)
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

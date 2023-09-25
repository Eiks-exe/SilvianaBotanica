import { Client, GatewayIntentBits, GuildMember, IntentsBitField, InteractionCollector, Message, REST, Routes, SlashCommandBuilder } from "discord.js"
import * as dotenv from 'dotenv'
import Controller from "./Controller"
import Info from "./Extensions/InfoExtension"
import Command from "./Model/Commands"
import { readdirSync } from "fs"

dotenv.config()

const main = async (): Promise<void> => {
    let controller: Controller<Command> | undefined
    const myIntents = new IntentsBitField();
    myIntents.add(
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        );
    const client = new Client({ intents: myIntents })
    client.on("ready", () => {
        console.log(`Logged in as ${client.user?.tag}!`);
        controller = client?.user?.id ? new Controller(client, client.user.id) : undefined;
        const extensionFile = readdirSync('./src/Extensions', {withFileTypes: true}).filter(file => file.isDirectory())
        extensionFile.forEach(async  (file) => {
            const extension = await import(`./Extensions/${file.name}`)
            const instance = new extension.default()
            controller?.Plug(instance)
        })

    })

    client.on('messageCreate', async message => {
       controller?.execute(message)
    })

    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;
        controller?.executeSlash(interaction)
     })

    client.login(process.env.TOKEN)
}

main()
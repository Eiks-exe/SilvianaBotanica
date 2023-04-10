import { Client, GatewayIntentBits, GuildMember, IntentsBitField, InteractionCollector, Message, REST, Routes, SlashCommandBuilder } from "discord.js"
import * as dotenv from 'dotenv'
import Controller from "./Controller"
import Info from "./Extensions/InfoExtension"
import Command from "./Model/Commands"
import { idText } from "typescript"

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
        client.user?.setUsername("Bonsay")
        controller = client?.user?.id ? new Controller(client.user.id) : undefined;
        controller?.Plug(new Info())

    })

    client.on('messageCreate', async message => {
       controller?.execute(message)
    })

    client.login(process.env.TOKEN)
}

main()
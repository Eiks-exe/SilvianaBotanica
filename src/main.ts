import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js"
import * as dotenv from 'dotenv'
dotenv.config()


const main = async (): Promise<void> => {
    const commands = [
        {
            name: 'ping',
            description: 'Replies with Pong!',
        },
    ];
    if (!process.env.TOKEN) return;
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    const client = new Client({ intents: [GatewayIntentBits.Guilds] })

    client.on('ready', async () => {

        console.log(`Logged in as ${client.user?.tag}!`);
        console.log('Started refreshing application (/) commands.');
        if(!client.user?.id) return;
        await rest.put(Routes.applicationCommands(client.user?.id), { body: commands });

        console.log('Successfully reloaded application (/) commands.');

    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'ping') {
            await interaction.reply('Pong!');
        }
    });

    client.login(process.env.TOKEN)
}

main()
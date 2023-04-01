import { Client, GatewayIntentBits, REST, Routes } from "discord.js"




const main = async (): Promise<void> => {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] })
    client.on('ready', () => {
        console.log(`Logged in as ${client.user?.tag}!`);
        const commands = [
            {
                name: 'ping',
                description: 'Replies with Pong!',
            },
        ];
        if (!process.env.TOKEN) return;
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

        (async () => {
            try {
                console.log('Started refreshing application (/) commands.');
                if (!client.user?.id) return;
                await rest.put(Routes.applicationCommands(client.user?.id), { body: commands });

                console.log('Successfully reloaded application (/) commands.');
            } catch (error) {
                console.error(error);
            }
        })();
    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'ping') {
            await interaction.reply('Pong!');
        }
    });

    client.login(process.env.TOKEN)
}
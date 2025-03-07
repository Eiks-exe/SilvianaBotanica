import { Client, ClientUser, Events, GatewayIntentBits, IntentsBitField, Interaction, Message } from 'discord.js';
import  ExtensionManager  from './Controllers/ExtensionManager';
import dotenv from "dotenv";
import path from 'path';
dotenv.config();


(async () => {
    const myIntents = new IntentsBitField();
    myIntents.add(
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
    );
    const client : Client = new Client({ intents: myIntents });
    const extPath = path.join(__dirname, "Extensions");
    const token = process.env.TOKEN;
    if (!token || !client) {
        throw new Error("Token or client not found");
    }
    
    const config = {
        client: client,
        token: token,   
        prefix: "!",
        ExtDir: extPath,
    }

    let ExtManager : ExtensionManager | undefined = undefined;
    
    
    client.once(Events.ClientReady, () => {
        console.log(`Logged in as ${client.user?.tag}`);
        ExtManager = new ExtensionManager(config);
        ExtManager.init()
    });

    client.on(Events.MessageCreate, async (message: Message) => {
        try {
            ExtManager?.execute(message);    
        }  catch (error) {
            console.error(error);
        }
    });

    client.on(Events.InteractionCreate, async (interaction: Interaction) => {
        console.log(`Interaction received: ${interaction}`);
        try {
            ExtManager?.executeSlash(interaction);
        } catch (error) {
            console.error(error);
        }
    });


    await client.login(token);
    

    
}
)();

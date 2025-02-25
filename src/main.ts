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
    const client = new Client({ intents: myIntents });
    const extPath = path.join(__dirname, "Extensions");
    const token = process.env.TOKEN;
    if (!token) throw new Error("Token undefined");
    
    const config = {
        token: token,   
        clientDiscord: client,
        prefix: "!",
        ExtDir: extPath,
    }

    const ExtManager = new ExtensionManager(config);
    ExtManager.init()
    
    client.once(Events.ClientReady, () => {
        console.log(`Logged in as ${client.user?.tag}`);
    });

    client.on(Events.MessageCreate, async (message: Message) => {
        try {
            ExtManager.execute(message);    
        }  catch (error) {
            console.error(error);
        }
    });


    client.login(token);
    

    
}
)();

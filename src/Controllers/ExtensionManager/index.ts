import { config } from 'dotenv';
import { ICommand } from '../../Interfaces/commands';
import { readdirSync } from 'fs';
import { 
    Client, 
    Message,
    REST,
    Routes,
    Interaction, 
    Collection
} from "discord.js";
import { ExtensionModel, IExtension } from 'src/Extensions/ExtensionModel';
import Module from 'module';
import path from 'path';
import { ClassDeclaration, ClassElement } from 'typescript';

interface Ipluglin {
    name: string;
    description: string;
    version: string;
    commands: ICommand[];
    execute: void;
}

interface Iconfig {
    client: Client;
    token: string;
    prefix: string;
    ExtDir: string;
}

interface slashCommand {
    name: string;
    description:string;
}

class ExtensionManager {
    commands: ICommand[];
    extensions: IExtension<ICommand>[]; 
    clientDiscord: Client
    constructor(private config: Iconfig ,) {
        this.config = config;
        this.extensions = [];
        this.commands = [];
        this.clientDiscord = config.client;
    }

    public init = async (): Promise<string> => {
        console.log("Initializing Extension Manager...");
        try {
            if (!this.clientDiscord.user || !this.clientDiscord.user.id) {
                throw new Error("Client not initialized");
            }
            const extPath = this.config.ExtDir;
            const extFiles = readdirSync(extPath, { withFileTypes: true }).filter((file) => file.isDirectory());
            extFiles.forEach(async (file) => {
                const extension = await import(path.join(extPath, file.name));
                console.log(`Loading extension ${file.name}, ${extension}`);
                const ext = new extension[file.name]();
                this.LoadExtension(extension, file.name);
            });
          
            return "Extension Manager initialized";
        } catch (error) {
            throw new Error((error as Error).message);
        }
    }

    
   

    private LoadExtension = async (extension : any, name : string) => {
        const ext : IExtension<ICommand> = new extension[name]();
        ext.init();
        console.log(`Extension ${ext.name} loaded`);
        console.log(`Commands: ${Array.from(ext.list().keys())}`);
        this.extensions.push(ext);
        ext.list().forEach((command) => {
            this.commands.push(command);
            console.log(`Command ${command.id} loaded`);    
        });
        this.LoadSlashCommands();
    };
  
    private  LoadSlashCommands = async () => {
        console.log("Loading slash commands...");
        const rest = new REST({ version: '10' }).setToken(this.config.token);
        const slashCommands = this.commands.filter((command) => command.types.includes("SLASH"));
        const commandsArray : slashCommand[]  = [];
        slashCommands.forEach(async (command) => {
            const  newCommand = {name: command.id, description: command.description};
            commandsArray.push(newCommand);
        });
        await rest.put(Routes.applicationCommands(this.clientDiscord.user?.id as string), { body: commandsArray });
         
        console.log("Slash commands loaded", slashCommands);
    }

    execute(message: Message) {
        try {
            if (message.author.bot) return;
            if (!message.content.startsWith(this.config.prefix)) return;
            const [prefix, command, ...args] = message.content.slice(this.config.prefix.length).split(" ");
            console.log("command requested", prefix , command, args);
            const cmd : ICommand | undefined = this.commands.find((cmd) => cmd.id === command);
            if (!cmd) return;
            cmd.execute(message, args);
        }  catch (error) {
            throw new Error((error as Error).message);
        }
    }

    executeSlash(interaction: Interaction) {
        try {
            if (!interaction.isCommand()) return;
            console.log("command requested", interaction.commandName);
            const cmd : ICommand | undefined = this.commands.find((cmd) => cmd.id === interaction.commandName);
            if (!cmd) return;
            cmd.execute(interaction);
        }  catch (error) {
            throw new Error((error as Error).message);
        }
    }
}

export default ExtensionManager;

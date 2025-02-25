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
    token: string;
    clientDiscord: Client;
    prefix: string;
    ExtDir: string;
}

class ExtensionManager {
    commands: ICommand[];
    extensions: IExtension<ICommand>[]; 
    constructor(private config: Iconfig) {
        this.config = config;
        this.extensions = [];
        this.commands = [];
    }

    public init = async (): Promise<string> => {
        return new Promise((resolve, reject) => {
            try {
                const extensionFile = readdirSync(`${this.config.ExtDir}/`, {
                    withFileTypes: true,
                }).filter((file) => file.isDirectory())
                extensionFile.forEach(async (file) => {
                    console.log(`attempting to load ${file.name}`); 
                    const extension = await import(this.config.ExtDir + `/${file.name}`);
                    this.LoadExtension(extension, file.name);
                })
                resolve("Extensions loaded");
            } catch (error) {
                reject(error);
            }
        });
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
    
    private LoadSlashCommands = () => {
        console.log("Loading slash commands...");
        const rest = new REST({ version: '10' }).setToken(this.config.token);
        const slashCommands = this.commands.filter((command) => command.types.includes("SLASH"));
        slashCommands.forEach(async (command) => {
            const  newCommand = {name: command.id, description: command.description, options: command.options};
            try {
                console.log(`Attempting to register command ${command.id}`);
                await rest.put(
                    Routes.applicationGuildCommands(this.config.clientDiscord.user?.id as string, "guild_id"),
                    { body: newCommand },
                );
                console.log(`Command ${command.id} registered as a (/) command`);
            } catch (error) {
                console.error(error);
            }
        });
        console.log("Slash commands loaded", slashCommands);
    }

    execute(message: Message) {
        try {
            const client = this.config.clientDiscord;
            console.log("command requested", message.content);
            console.log(client.user?.id, client.user?.discriminator); 
        }  catch (error) {
            throw new Error((error as Error).message);
        }
    }

    executeSlash(interaction: Interaction) {
        try {
            if (!interaction.isCommand()) return;
            console.log("command requested", interaction.commandName);
            this.commands.filter((command) => command.id === interaction.commandName).forEach((command) => {
                command.execute(interaction);
            });
        }  catch (error) {
            throw new Error((error as Error).message);
        }
    }
}

export default ExtensionManager;

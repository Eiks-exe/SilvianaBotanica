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

    private LoadExtension = (extension : any, name : string) => {
        const rest = new REST({ version: '10' }).setToken(this.config.token);
        /* const ext : IExtension<ICommand> = new extension[name]();
        ext.init();
        console.log(`Extension ${ext.name} loaded`);
        console.log(`Commands: ${Array.from(ext.list().keys())}`);
        this.extensions.push(ext);
        ext.list().forEach((command) => {
            this.commands.type.contains("SLASH") ? this.LoadInteraction(command) : continue;
            this.commands.push(command);
            console.log(`Command ${command.id} loaded`);    
        }); */
        
    };
    
    LoadInteraction = (interaction: Interaction) => {
        
       
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

    executeInteraction(Interaction: Interaction) {
        try {
            const client = this.config.clientDiscord;
            console.log("command requested", Interaction);
            console.log(client.user?.id, client.user?.discriminator); 
        }  catch (error) {
            throw new Error((error as Error).message);
        }
    }
}

export default ExtensionManager;

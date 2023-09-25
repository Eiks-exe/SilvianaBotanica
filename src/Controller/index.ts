import { ICommand } from "src/Interfaces/commands";
import { ExtensionModel } from "src/Extensions/extensionModel";
import Command from "src/Model/Commands";
import { EventType } from "src/Interfaces/Interfaces";
import { 
    Client, 
    Message,
    REST,
    Routes,
    Interaction, 
} from "discord.js";

interface IController<T extends Command> {
    Plug(extension: ExtensionModel<T>): void;
    execute(event: EventType): void;
}

/**
 * Controller class that implements the IController interface.
 * @template T - The type of the command.
 */
export default class Controller<T extends ICommand> implements IController<T> {
    /**
     * Creates an instance of Controller.
     * @param {string} clientId - The client ID.
     */
    constructor(client:Client, clientId: string) {
        this.client = client;
        this.clientId = clientId;
        this.commands = [];
        this.extensions = [];
    }

    private client: Client;
    /** The client ID. */
    private clientId: string;

    /** The list of commands. */
    private commands: Command[]


    /** The list of extensions. */
    private extensions: ExtensionModel<T>[];

    /**
     * Collects the extension.
     * @param {ExtensionModel<T>} extension - The extension to collect.
     * @returns {Promise<string>} - A promise that resolves with a success message or rejects with an error message.
     */
    private collectExtension = (extension: ExtensionModel<T>): Promise<string> => {
        return new Promise((resolve, reject) => {
            try {
                this.extensions.push(extension)
                resolve("plugged with success ✅")
            } catch (error) {
                console.error(error)
                reject("❌")
            }
        })

    }

    /**
     * Plugs the extension.
     * @param {ExtensionModel<T>} extension - The extension to plug.
     */
    public Plug(extension: ExtensionModel<T>): void {
        const token = process.env.TOKEN;
        if(token === undefined) throw new Error("TOKEN is undefined")
        const rest = new REST({ version: '10' }).setToken(token);

        extension.list((command: Command) => {
            this.commands.push(command)
            console.log(command.id, command.description);
        })
        if (this.client.user?.id === undefined) throw new Error("client.user.id is undefined")
        const slashCommands = this.commands.filter((command: ICommand) => command.types.includes("slash"))
        const slashCommandBody = slashCommands.map((command : ICommand ) => {
            return { name : command.id, description: command.description, options: command.options ? command.options : []}
        })
        console.log(slashCommandBody)
        console.log (this.commands)
        rest.put(Routes.applicationCommands(this.client.user?.id), { body: slashCommandBody })
            .then(() => {
                this.collectExtension(extension)
                    .then(response => console.log(`${extension.name} : ${response}`))
                    .catch(error => console.error(`${extension.name} : ${error}`))
            })
            .catch(error => console.error(`${extension.name} : ${error}`))
    }


    /**
     * @description Executes the command.
     * @param {Message} message - The message object.
     */
    public execute(message: Message) {
        try {
            const clientIdRegex: any = this.clientId ? new RegExp(`^(<@!?${this.clientId})>`) : (process.env.PREFIX);
            console.log(!clientIdRegex.test(message.content))
            if (!clientIdRegex.test(message.content)) return;
            console.log(message.content.split(' '))
            const [cltId, command, ...query] = message.content.split(' ')
            console.log("payload:", cltId, command, query)
            const cmd = this.commands.find((cmd)=> cmd.id === command)
            cmd?.method(message, query)
        } catch (error) {
            console.error(error)
        }
    }
    public executeSlash(interaction: Interaction) {
        try {
            if (!interaction.isCommand()) return;
            console.log(interaction.commandName)
            const command = this.commands.find((cmd)=> cmd.id === interaction.commandName)
            command?.method(interaction, interaction.options)
        } catch (error) {
            console.error(error)
        }
    }
}
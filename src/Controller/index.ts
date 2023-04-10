import { ICommand } from "src/Interfaces/commands";
import { ExtensionModel } from "src/Extensions/extensionModel";
import Command from "src/Model/Commands";
import { EventType } from "src/Interfaces/Interfaces";
import { Client, Message } from "discord.js";

interface IController<T extends Command> {
    Plug(extension: ExtensionModel<T>): void;
    execute(event: EventType): void;
}

export default class Controller<T extends ICommand> implements IController<T> {
    constructor(clientId: string) {
        this.clientId = clientId;
        this.commands = [];
        this.extensions = [];
    }
    private clientId: string;
    private commands: Command[]
    private extensions: ExtensionModel<T>[];

    private collectExtension = (extension: ExtensionModel<T>) => {
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
    public Plug(extension: ExtensionModel<T>): void {
        extension.list((command: Command) => {
            this.commands.push(command);
            console.log(command.id, command.description);
        })

        this.collectExtension(extension)
            .then(response => console.log(`${extension.name} : ${response}`))
            .catch(error => console.error(`${extension.name} : ${error}`))
    }

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
}
import { ICommand } from "../../Interfaces/commands";
import { ExtensionModel } from "../ExtensionModel";
import { Message } from "discord.js";


export class Info extends ExtensionModel<ICommand> {
    constructor() {
        super("Info", "Info commands", "1.0.0");
    }

    public init = async () => {
        this.register("info", {
            id: "info",
            description: "Get info about the bot",
            types: ["MESSAGE"],
            execute: async (message: Message) => {
                try {
                    message.reply(`Bot name: ${message.client.user?.username}`);
                } catch (error) {
                    console.error(error);
                }
            }
        });
    }
}



import { ICommand } from "../../Interfaces/commands";
import { ExtensionModel } from "../ExtensionModel";
import { Embed, EmbedBuilder, Message } from "discord.js";


export class Info extends ExtensionModel<ICommand> {
    constructor() {
        super("Info", "Info commands", "1.0.0");
    }

    public init = async () => {
        this.register("info", {
            id: "info",
            description: "Get info about the bot",
            types: ["MESSAGE", "SLASH"],
            execute: this.info,
        });
    };

   public info = async (message: Message) => {
        const InfoEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Info')
        .setURL('https://discord.js.org/')
        .setAuthor({ name: message.client.user.username , iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
        .setDescription('Silvia is a bot that is designed to help you with your server needs.')
        .setThumbnail('https://i.imgur.com/AfFp7pu.png')
        .addFields(
            { name: 'Commands:', value: 'info' },
            { name: '\u200B', value: '\u200B' },
        )
        .setImage('https://i.imgur.com/AfFp7pu.png')
        .setTimestamp()
        .setFooter({ text: 'Silvianna Botannica', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
        message.channel.isSendable() && message.channel.send({embeds: [InfoEmbed]});
    }
}



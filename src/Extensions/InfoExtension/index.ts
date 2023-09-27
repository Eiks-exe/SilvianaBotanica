import { ICommand } from "src/Interfaces/commands";
import { ExtensionModel } from "../extensionModel";
import { Interaction, Message} from "discord.js";

type EventType = Interaction | Message


const ping = (event: EventType, query:[])=>{
    event instanceof Message ? event.reply('pong') : event.isChatInputCommand() ? event.reply("pong") : null ;
}

const Info: ExtensionModel<ICommand> = {
    name: "Info",
    commands: {
        ping: {id : "ping", description: "ping pong", types: ["CHAT", "SLASH"], method: ping}
    }
}

export default Info
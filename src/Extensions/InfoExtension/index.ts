import Command from "../../Model/Commands";
import { ExtensionModel } from "../extensionModel";
import { Interaction, Message} from "discord.js";

type EventType = Interaction | Message


export default class Info extends ExtensionModel<Command>{
   
    private ping: Command = new Command('ping', 'pong',["message", "slash"] , async (event : EventType , query: [])=>{
        event instanceof Message ? event.reply('pong') : event.isChatInputCommand() ? event.reply("pong") : null ;
    })
    private time: Command = new Command('time', 'Get current time', ["message"], () => {
        console.log(new Date().toString())
    })
    
    constructor(){
        super("info");
        this.register(this.ping)
        this.register(this.time)
    }
}

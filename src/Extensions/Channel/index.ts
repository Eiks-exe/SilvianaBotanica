import { ICommand } from "src/Interfaces/commands";
import { ExtensionModel } from "../extensionModel";
import { CategoryCreateChannelOptions, ChannelType, GuildChannel, GuildChannelCreateOptions, Interaction } from "discord.js";
import { randomInt } from "crypto";
import { channel } from "diagnostics_channel";

type EventType = Interaction;


const create = (event: Interaction, query:[])=>{
   if(!event.isCommand()) return;
    const channelName = event.options.get("name")?.value?.toString()
    const usersID = event.options.get("users")?.user?.id
    const everyoneRole = event.guild?.roles.everyone
    if(!everyoneRole) return;
    if( typeof(usersID) !== "string" )return;
    const options: GuildChannelCreateOptions = {
        name: channelName ? channelName : `channel-${randomInt(1000)}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
            {
                id: everyoneRole.id ,
                deny: ["ViewChannel"]
            },
            {
                id: event.user.id,
                allow: ["ViewChannel"]
            },
            {
                id: usersID,
                allow: ["ViewChannel"]
            }
        ]
    }
    event.reply("test channel" + channelName)
    event.guild?.channels.create(options)
}


const Channel: ExtensionModel<ICommand> = {
    name: "Info",
    commands: {
        ping: {id : "channel-create", description: "create a channel", types: ["CHAT", "SLASH"], method: create, options: [
            {
                name: "name",
                description: "The name of the channel",
                type: 3,
            },
            {
                name: "users",
                description: "The users to give access to the channel",
                type: 6,
            },
        ]}
    }
}

export default Channel
import { ICommand } from "src/Interfaces/commands";
import { ExtensionModel } from "../extensionModel";
import { ChannelType, GuildChannelCreateOptions, Interaction, VoiceChannel } from "discord.js";
import { randomInt } from "crypto";

interface VoiceChannelConfig {
  author: string,
  name: string,
  user_limit?: number,
  private: boolean
};

const text_channel_create = (event: Interaction, query:[])=>{
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
    event.reply(`The channel ${options.name} with has been created \n members: ${event.user.username}, ${usersID}`)
    event.guild?.channels.create(options)
}

const defaultVoiceChannelConfig: VoiceChannelConfig = {
  author : "unknown",
  name : "new table",
  private: false
};

const voice_channel_create = (config: Partial<VoiceChannelConfig>) => {
  const finalConfig = {...defaultVoiceChannelConfig, config}
  console.log(finalConfig)
};

const Channel: ExtensionModel<ICommand> = {
    name: "Channel",
    commands: {
        textChannelCreate: {id : "channel-create", description: "create a text channel", types: ["CHAT", "SLASH"], method: text_channel_create, options: [
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
        ]},
        VoiceChannelCreate: {id: "voice_channel_create", description: "create a voice channel", types: ["CHAT"], method: voice_channel_create}, 
        
    }
}

export default Channel

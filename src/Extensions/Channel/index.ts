import { ICommand } from "src/Interfaces/commands";
import { ExtensionModel } from "../extensionModel";
import { BaseGuildVoiceChannel, CategoryChannel, ChannelType, GuildChannelCreateOptions, Interaction, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import { randomInt } from "crypto";
import { createHostVc, getHostChannelForGuild, resetGuildHost } from "../../Controllers/VoiceController";

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

const create_host_voice_channel = async (event: Interaction) => {
  let host : BaseGuildVoiceChannel | undefined;
  let host_parentId : string | undefined;
  let host_parent : CategoryChannel | undefined;
  if (!event.isCommand()) return;
  if (!event.guild) return;
  
  const existingHostVc = await getHostChannelForGuild(event.guild?.id);
  
  if(existingHostVc){
    event.reply("a host channel already exist on this server")
    return;
  }

  const channelName = event.options.get("name")?.value?.toString()
  if (!channelName) return;
  const parent_category = event.options.get("parent_category")?.value?.toString();
  
  host_parentId = event.options.get("host_parent")?.value?.toString();
  if(host_parentId) host_parent = event.guild.channels.cache.get(host_parentId) as CategoryChannel;

  const options : GuildChannelCreateOptions = {
    name: channelName,
    type: ChannelType.GuildVoice,
    parent: host_parent
  }
  
  if (parent_category){
    host = await createHostVc(event.guild, options, parent_category)
  } else {
    host = await createHostVc(event.guild, options)
  }
  if (!host) throw new Error(`Could not create host for ${event.guild.name}, guild id : ${event.guild.id}`);
  event.reply(`set up done host channel : ${host.name}`)
  return host
};


const reset_host_config = (event : Interaction) => {
  if (!event.isCommand()) return;
  if (!event.guild) return; 
  resetGuildHost(event.guild?.id);
  event.reply({
    content: "reset done",
    ephemeral: true
  })
}


const Channel: ExtensionModel<ICommand> = {
    name: "Channel",
    commands: {
        textChannelCreate: {id : "channel-create", description: "create a private text channel", types: ["CHAT", "SLASH"], method: text_channel_create, options: [
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
        HostChannelCreate: {id: "setup_host_channel", description: "create a host channel", types: ["SLASH"], method: create_host_voice_channel, default_member_permision: [PermissionFlagsBits.ManageChannels] , options: [
          {
            name:"name",
            description: "name the host channel",
            type:3,
            required: true 
          },
          {
            name: "parent_category",
            description: "parents of the personal voice channels",
            type: 3
          },
          {
            name:"host_parent",
            description: "in wich category would you like to put the host in",
            type:7
          }
        ]},
        resetGuildHost: {id: "reset_host_config", description: "remove the host channel from (only) the database ", types:["SLASH"], method:reset_host_config, default_member_permision: [PermissionFlagsBits.ManageChannels] }
    }
}

export default Channel

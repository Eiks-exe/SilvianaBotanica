import {
  ChannelType,
  VoiceState,
  PermissionFlagsBits,
  CategoryChannel,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  GuildBasedChannel,
} from "discord.js";
import { getHostChannelForGuild, getTableCategoryId_byGuildId } from "../VoiceController";


export async function onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {

  let tableChannel : GuildBasedChannel | null  = null;
  let TABLE_CATEGORY_ID: string | undefined = undefined;
  const guild = newState.guild
  const hostdb = await getHostChannelForGuild(guild.id);
  if(!hostdb) return; 
  const host_channel = guild.channels.cache.get(hostdb.channel_id)
  const RECEPTION_CHANNEL_ID =  hostdb.channel_id;// Reception voice channel
  TABLE_CATEGORY_ID = await getTableCategoryId_byGuildId(guild.id);   // Category for tables

  // Trigger only when user joins the Reception channel
  if(!RECEPTION_CHANNEL_ID) return;
  if (newState.channelId === RECEPTION_CHANNEL_ID && oldState.channelId !== RECEPTION_CHANNEL_ID) {
    const member = newState.member;
    if (!member) return;
    let tableCategory: CategoryChannel | null = null;

    if (TABLE_CATEGORY_ID) {
      const fetched = guild.channels.cache.get(TABLE_CATEGORY_ID);
      if(fetched && fetched.type === ChannelType.GuildCategory){
        tableCategory = fetched as CategoryChannel;
      }
    } else if (host_channel && host_channel?.parent && host_channel.parent.type === ChannelType.GuildCategory) {
      tableCategory = host_channel.parent;
      TABLE_CATEGORY_ID = host_channel.parentId ? host_channel.parentId : undefined; 
    }
    let existingTable : GuildBasedChannel | undefined = undefined;
    if (!tableCategory) {
      existingTable = guild.channels.cache.find(
        c => c.name === `table-${member.user.username.toLowerCase()}` 
      )
      
    } else if (tableCategory) {
      existingTable = tableCategory.children.cache.find(
        c => c.name === `table-${member.user.username.toLowerCase()}`
      );
    }    // Prevent duplicate table creaution

    if (existingTable) {
      await member.voice.setChannel(existingTable.id);
      return;
    }

    // Create the private table (voice channel)
    tableChannel = await guild.channels.create({
      name: `${member.user.username.toLowerCase()}'s table`,
      type: ChannelType.GuildVoice,
      parent: tableCategory,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [ PermissionFlagsBits.Connect],
        },
        {
          id: member.id,
          allow: [
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.MoveMembers,
          ],
        },
      ],
    });

    // Move user to their new table
    await member.voice.setChannel(tableChannel);
    
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
      new ButtonBuilder()
        .setCustomId('invite_guests')
        .setLabel('Invite Guests')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('adjust_seats')
        .setLabel('Adjust Seats')
        .setStyle(ButtonStyle.Secondary), 
      new ButtonBuilder()
        .setCustomId('privacy')
        .setLabel('Accessibility')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('close_table')
        .setLabel('Close')
        .setStyle(ButtonStyle.Danger)
  );
    // Optional: Notify them in DM or in a log channel
    try {
      tableChannel.send({
        content: `🍽️ Your table has been prepared: **${tableChannel.name}**. \n You can invite your guests by tagging them or sharing this channel link.\n Our staff will handle the rest. Enjoy your stay. `,
        components: [row]
      });
    } catch {
      console.log(`could not send a message to the table's guild`);
    }
  }

  // Optional cleanup: delete empty tables
  if (
    oldState.channel &&
    oldState.channel.parentId === TABLE_CATEGORY_ID &&
    oldState.channel.members.size === 0
  ) {
    await oldState.channel.delete("Table empty — auto-cleanup");
  }
}


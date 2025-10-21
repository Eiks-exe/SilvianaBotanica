import {
  ChannelType,
  VoiceState,
  PermissionFlagsBits,
  CategoryChannel,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuInteraction
} from "discord.js";



export async function onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
  const RECEPTION_CHANNEL_ID = process.env.HOST_VC_ID; // Reception voice channel
  const TABLE_CATEGORY_ID = process.env.TABLE_CATEGORY_ID;   // Category for tables

  // Trigger only when user joins the Reception channel
  if(!RECEPTION_CHANNEL_ID || !TABLE_CATEGORY_ID) return;
  if (newState.channelId === RECEPTION_CHANNEL_ID && oldState.channelId !== RECEPTION_CHANNEL_ID) {
    const member = newState.member;
    if (!member) return;
    const guild = newState.guild;
    const tableCategory = guild.channels.cache.get(TABLE_CATEGORY_ID) as CategoryChannel;

    // Prevent duplicate table creation
    const existingTable = tableCategory.children.cache.find(
      c => c.name === `table-${member.user.username.toLowerCase()}`
    );
    if (existingTable) {
      await member.voice.setChannel(existingTable.id);
      return;
    }

    // Create the private table (voice channel)
    const tableChannel = await guild.channels.create({
      name: `${member.user.username.toLowerCase()}'s table`,
      type: ChannelType.GuildVoice,
      parent: TABLE_CATEGORY_ID,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.Connect],
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


import { ButtonInteraction, Interaction } from "discord.js";      
import { handleInviteGuestInteraction } from "../TableController/tableManager"
const handleButtonInteraction = (interaction: ButtonInteraction) => {
  switch (interaction.customId) {
    case 'invite_guest':
      return handleInviteGuestInteraction(interaction);
  }
}

import { showToast, Toast, confirmAlert, Alert } from "@raycast/api";
import { getStatus, toggleMute, isMuteDeckRunning, isInMeeting, isMuted, isPresenting, isRecording, getPreferences } from "./utils/api";

export default async function Command() {
  let loadingToast: Toast | undefined;
  
  try {
    // Show initial loading state
    loadingToast = await showToast({
      style: Toast.Style.Animated,
      title: "Checking MuteDeck status..."
    });

    const status = await getStatus();
    const { showToasts, confirmMuteInPresentation } = getPreferences();

    if (!isMuteDeckRunning(status)) {
      if (showToasts) {
        await loadingToast.hide();
        await showToast({
          style: Toast.Style.Failure,
          title: "MuteDeck Not Running",
          message: "Please start MuteDeck and try again.\n\nTroubleshooting:\n1. Check if MuteDeck is installed\n2. Launch MuteDeck from your Applications\n3. Wait a few seconds and try again"
        });
      }
      return;
    }

    // Check if confirmation is needed
    if (confirmMuteInPresentation && (isPresenting(status) || isRecording(status))) {
      await loadingToast.hide();
      
      const confirmed = await confirmAlert({
        title: "Toggle Microphone While Presenting",
        message: `Are you sure you want to ${isMuted(status) ? "unmute" : "mute"} while ${isPresenting(status) ? "presenting" : "recording"}?\n\nThis may disrupt your current ${isPresenting(status) ? "presentation" : "recording"}.`,
        primaryAction: {
          title: isMuted(status) ? "Unmute" : "Mute",
          style: Alert.ActionStyle.Default,
        },
        dismissAction: {
          title: "Cancel",
        },
      });

      if (!confirmed) {
        return;
      }

      // Show new loading state after confirmation
      loadingToast = await showToast({
        style: Toast.Style.Animated,
        title: "Toggling microphone..."
      });
    } else {
      // Update loading state
      loadingToast = await showToast({
        style: Toast.Style.Animated,
        title: "Toggling microphone..."
      });
    }

    // Don't block on meeting status - allow toggle even if not in meeting
    await toggleMute();
    const newStatus = await getStatus();
    
    if (showToasts) {
      await loadingToast.hide();
      await showToast({
        style: Toast.Style.Success,
        title: isMuted(newStatus) ? "Microphone Muted" : "Microphone Unmuted",
        message: isInMeeting(newStatus) ? undefined : "Note: Not in a meeting"
      });
    }
  } catch (error) {
    console.error("Toggle microphone error:", error);
    if (getPreferences().showToasts) {
      await loadingToast?.hide();
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Toggle Microphone",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  }
} 
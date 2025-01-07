import { showToast, Toast, confirmAlert, Alert } from "@raycast/api";
import { getStatus, toggleVideo, isMuteDeckRunning, isInMeeting, isVideoOn, isPresenting, isRecording, getPreferences } from "./utils/api";

export default async function Command() {
  let loadingToast: Toast | undefined;
  
  try {
    // Show initial loading state
    loadingToast = await showToast({
      style: Toast.Style.Animated,
      title: "Checking MuteDeck status..."
    });

    const status = await getStatus();
    const { showToasts, confirmVideoInPresentation } = getPreferences();

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
    if (confirmVideoInPresentation && (isPresenting(status) || isRecording(status))) {
      await loadingToast.hide();
      
      const confirmed = await confirmAlert({
        title: "Toggle Camera While Presenting",
        message: `Are you sure you want to turn the camera ${isVideoOn(status) ? "off" : "on"} while ${isPresenting(status) ? "presenting" : "recording"}?\n\nThis may disrupt your current ${isPresenting(status) ? "presentation" : "recording"}.`,
        primaryAction: {
          title: isVideoOn(status) ? "Turn Off Camera" : "Turn On Camera",
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
        title: "Toggling camera..."
      });
    } else {
      // Update loading state
      loadingToast = await showToast({
        style: Toast.Style.Animated,
        title: "Toggling camera..."
      });
    }

    // Don't block on meeting status - allow toggle even if not in meeting
    await toggleVideo();
    const newStatus = await getStatus();
    
    if (showToasts) {
      await loadingToast.hide();
      await showToast({
        style: Toast.Style.Success,
        title: isVideoOn(newStatus) ? "Camera Turned On" : "Camera Turned Off",
        message: isInMeeting(newStatus) ? undefined : "Note: Not in a meeting"
      });
    }
  } catch (error) {
    console.error("Toggle video error:", error);
    if (getPreferences().showToasts) {
      await loadingToast?.hide();
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Toggle Camera",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  }
} 
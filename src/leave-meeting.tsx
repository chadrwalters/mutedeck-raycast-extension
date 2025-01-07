import { showToast, Toast, confirmAlert, Alert } from "@raycast/api";
import { getStatus, leaveMeeting, isMuteDeckRunning, isInMeeting, getPreferences } from "./utils/api";

export default async function Command() {
  let loadingToast: Toast | undefined;
  
  try {
    // Show initial loading state
    loadingToast = await showToast({
      style: Toast.Style.Animated,
      title: "Checking MuteDeck status..."
    });

    const status = await getStatus();
    const { confirmLeave, showToasts } = getPreferences();

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

    if (!isInMeeting(status)) {
      if (showToasts) {
        await loadingToast.hide();
        await showToast({
          style: Toast.Style.Failure,
          title: "No Active Meeting",
          message: "Please join a meeting first.\n\nTroubleshooting:\n1. Check if you're in a meeting\n2. Make sure your meeting app is supported\n3. Try rejoining the meeting"
        });
      }
      return;
    }

    await loadingToast.hide();

    if (confirmLeave) {
      const confirmed = await confirmAlert({
        title: "Leave Meeting",
        message: "Are you sure you want to leave the current meeting?\n\nThis will disconnect you from the current call.",
        primaryAction: {
          title: "Leave Meeting",
          style: Alert.ActionStyle.Destructive,
        },
        dismissAction: {
          title: "Cancel",
        },
      });

      if (!confirmed) {
        return;
      }
    }

    // Show leaving state
    loadingToast = await showToast({
      style: Toast.Style.Animated,
      title: "Leaving meeting..."
    });

    await leaveMeeting();
    
    if (showToasts) {
      await loadingToast.hide();
      await showToast({
        style: Toast.Style.Success,
        title: "Left Meeting",
        message: "Successfully left the meeting"
      });
    }
  } catch (error) {
    console.error("Leave meeting error:", error);
    if (getPreferences().showToasts) {
      await loadingToast?.hide();
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Leave Meeting",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  }
} 
import { showToast, Toast } from "@raycast/api";
import { getStatus, toggleMute, isMuteDeckRunning, isInMeeting, isMuted } from "../utils/api";

export default async function Command() {
  try {
    const status = await getStatus();

    if (!isMuteDeckRunning(status)) {
      await showToast({
        style: Toast.Style.Failure,
        title: "MuteDeck Not Running",
        message: "Please start MuteDeck and try again"
      });
      return;
    }

    if (!isInMeeting(status)) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No Active Meeting",
        message: "Please join a meeting first"
      });
      return;
    }

    await toggleMute();
    const newStatus = await getStatus();
    
    await showToast({
      style: Toast.Style.Success,
      title: isMuted(newStatus) ? "Microphone Muted" : "Microphone Unmuted"
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to Toggle Microphone",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
} 
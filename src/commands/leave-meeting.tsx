import { showToast, Toast, confirmAlert } from "@raycast/api";
import { getStatus, leaveMeeting, isMuteDeckRunning, isInMeeting } from "../utils/api";

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
        message: "You are not in a meeting"
      });
      return;
    }

    const confirmed = await confirmAlert({
      title: "Leave Meeting",
      message: "Are you sure you want to leave the current meeting?",
      primaryAction: {
        title: "Leave Meeting",
      },
      dismissAction: {
        title: "Cancel",
      },
    });

    if (!confirmed) return;

    await leaveMeeting();
    await showToast({
      style: Toast.Style.Success,
      title: "Left Meeting",
      message: "Successfully left the meeting"
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to Leave Meeting",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
} 
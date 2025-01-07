import { getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";

export interface MuteDeckStatus {
  call: string;
  control: string;
  mute: string;
  record: string;
  share: string;
  status: number;
  teams_api: string;
  video: string;
}

interface Preferences {
  apiEndpoint: string;
  statusRefreshInterval: string;
  confirmLeave: boolean;
  confirmMuteInPresentation: boolean;
  confirmVideoInPresentation: boolean;
  showToasts: boolean;
}

export function getPreferences(): Preferences {
  return getPreferenceValues<Preferences>();
}

function getBaseUrl(): string {
  const { apiEndpoint } = getPreferences();
  return apiEndpoint.endsWith("/") ? apiEndpoint.slice(0, -1) : apiEndpoint;
}

export async function getStatus(): Promise<MuteDeckStatus> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/v1/status`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "MuteDeck API endpoint not found. Please check:\n\n" +
          "1. MuteDeck is running\n" +
          "   - Check if MuteDeck is in your system tray\n" +
          "   - Try restarting MuteDeck\n" +
          "2. The API endpoint is correct in preferences\n" +
          "   - Default should be http://localhost:3491\n" +
          "   - Check for any typos in the URL\n" +
          "3. No firewall is blocking port 3491\n" +
          "   - Check your firewall settings\n" +
          "   - Try temporarily disabling firewall to test\n" +
          "4. You have the latest version of MuteDeck\n" +
          "   - Check for updates in MuteDeck settings"
        );
      }
      throw new Error(
        `API request failed (${response.status}). Please check:\n\n` +
        "1. MuteDeck is running properly\n" +
        "   - Check if MuteDeck shows green status\n" +
        "   - Try restarting MuteDeck\n" +
        "2. You have the latest version of MuteDeck\n" +
        "   - Check for updates in MuteDeck settings\n" +
        "   - Visit MuteDeck website for latest version\n" +
        "3. The API endpoint is accessible\n" +
        "   - Try opening the URL in your browser\n" +
        "   - Check if localhost resolves correctly"
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        "Could not connect to MuteDeck. Please check:\n\n" +
        "1. MuteDeck is installed and running\n" +
        "   - Look for MuteDeck in your system tray\n" +
        "   - Try restarting MuteDeck\n" +
        "2. The API endpoint is correct in preferences\n" +
        "   - Default should be http://localhost:3491\n" +
        "   - Check for any typos in the URL\n" +
        "3. Your network connection is working\n" +
        "   - Check if localhost is accessible\n" +
        "   - Try restarting your network connection\n" +
        "4. Your system's firewall settings\n" +
        "   - Allow MuteDeck through your firewall\n" +
        "   - Check port 3491 is not blocked"
      );
    }
    throw error;
  }
}

export async function toggleMute(): Promise<void> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/v1/mute`, { method: 'POST' });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          "Cannot toggle microphone. Please check:\n\n" +
          "1. MuteDeck has permission to control your microphone\n" +
          "   - Check System Preferences > Security & Privacy\n" +
          "   - Grant microphone access to MuteDeck\n" +
          "2. Your microphone is properly connected\n" +
          "   - Check System Preferences > Sound\n" +
          "   - Test microphone in another app\n" +
          "3. No other app is controlling your microphone\n" +
          "   - Check for other meeting apps running\n" +
          "   - Close conflicting applications\n" +
          "4. Your meeting app is supported\n" +
          "   - Check MuteDeck's supported apps list\n" +
          "   - Ensure meeting app is up to date"
        );
      }
      throw new Error(
        `Failed to toggle microphone (${response.status}). Please check:\n\n` +
        "1. Your microphone is properly connected\n" +
        "   - Check System Preferences > Sound\n" +
        "   - Test microphone in another app\n" +
        "2. You have the latest version of MuteDeck\n" +
        "   - Check for updates in MuteDeck settings\n" +
        "   - Visit MuteDeck website for latest version\n" +
        "3. MuteDeck has necessary permissions\n" +
        "   - Check System Preferences > Security & Privacy\n" +
        "   - Grant required permissions to MuteDeck\n" +
        "4. Your meeting app is properly detected\n" +
        "   - Check if meeting app is supported\n" +
        "   - Try restarting your meeting app"
      );
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        "Could not connect to MuteDeck. Please check:\n\n" +
        "1. MuteDeck is still running\n" +
        "   - Look for MuteDeck in your system tray\n" +
        "   - Try restarting MuteDeck\n" +
        "2. Your network connection is stable\n" +
        "   - Check if localhost is accessible\n" +
        "   - Try restarting your network connection\n" +
        "3. The API endpoint is accessible\n" +
        "   - Default should be http://localhost:3491\n" +
        "   - Check for any typos in the URL\n" +
        "4. Your system's firewall settings\n" +
        "   - Allow MuteDeck through your firewall\n" +
        "   - Check port 3491 is not blocked"
      );
    }
    throw error;
  }
}

export async function toggleVideo(): Promise<void> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/v1/video`, { method: 'POST' });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          "Cannot toggle camera. Please check:\n\n" +
          "1. MuteDeck has permission to control your camera\n" +
          "   - Check System Preferences > Security & Privacy\n" +
          "   - Grant camera access to MuteDeck\n" +
          "2. Your camera is properly connected\n" +
          "   - Check System Preferences > Camera\n" +
          "   - Test camera in another app\n" +
          "3. No other app is using your camera\n" +
          "   - Check for other apps using camera\n" +
          "   - Close conflicting applications\n" +
          "4. Your meeting app is supported\n" +
          "   - Check MuteDeck's supported apps list\n" +
          "   - Ensure meeting app is up to date"
        );
      }
      throw new Error(
        `Failed to toggle camera (${response.status}). Please check:\n\n` +
        "1. Your camera is properly connected\n" +
        "   - Check System Preferences > Camera\n" +
        "   - Test camera in another app\n" +
        "2. You have the latest version of MuteDeck\n" +
        "   - Check for updates in MuteDeck settings\n" +
        "   - Visit MuteDeck website for latest version\n" +
        "3. MuteDeck has necessary permissions\n" +
        "   - Check System Preferences > Security & Privacy\n" +
        "   - Grant required permissions to MuteDeck\n" +
        "4. Your meeting app is properly detected\n" +
        "   - Check if meeting app is supported\n" +
        "   - Try restarting your meeting app"
      );
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        "Could not connect to MuteDeck. Please check:\n\n" +
        "1. MuteDeck is still running\n" +
        "   - Look for MuteDeck in your system tray\n" +
        "   - Try restarting MuteDeck\n" +
        "2. Your network connection is stable\n" +
        "   - Check if localhost is accessible\n" +
        "   - Try restarting your network connection\n" +
        "3. The API endpoint is accessible\n" +
        "   - Default should be http://localhost:3491\n" +
        "   - Check for any typos in the URL\n" +
        "4. Your system's firewall settings\n" +
        "   - Allow MuteDeck through your firewall\n" +
        "   - Check port 3491 is not blocked"
      );
    }
    throw error;
  }
}

export async function leaveMeeting(): Promise<void> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/v1/leave`, { method: 'POST' });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "No active meeting found. Please check:\n\n" +
          "1. You are currently in a meeting\n" +
          "   - Check if meeting is actually running\n" +
          "   - Try rejoining the meeting\n" +
          "2. The meeting is properly connected\n" +
          "   - Check if meeting app is responding\n" +
          "   - Try restarting the meeting app\n" +
          "3. MuteDeck can detect your meeting app\n" +
          "   - Check if app is in supported list\n" +
          "   - Ensure meeting app is up to date\n" +
          "4. MuteDeck has necessary permissions\n" +
          "   - Check System Preferences > Security & Privacy\n" +
          "   - Grant required permissions to MuteDeck"
        );
      }
      throw new Error(
        `Failed to leave meeting (${response.status}). Please check:\n\n` +
        "1. The meeting is still active\n" +
        "   - Check if you're still connected\n" +
        "   - Try refreshing meeting status\n" +
        "2. You have the latest version of MuteDeck\n" +
        "   - Check for updates in MuteDeck settings\n" +
        "   - Visit MuteDeck website for latest version\n" +
        "3. Your meeting app is supported\n" +
        "   - Check MuteDeck's supported apps list\n" +
        "   - Ensure meeting app is up to date\n" +
        "4. MuteDeck has necessary permissions\n" +
        "   - Check System Preferences > Security & Privacy\n" +
        "   - Grant required permissions to MuteDeck"
      );
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        "Could not connect to MuteDeck. Please check:\n\n" +
        "1. MuteDeck is still running\n" +
        "   - Look for MuteDeck in your system tray\n" +
        "   - Try restarting MuteDeck\n" +
        "2. Your network connection is stable\n" +
        "   - Check if localhost is accessible\n" +
        "   - Try restarting your network connection\n" +
        "3. The API endpoint is accessible\n" +
        "   - Default should be http://localhost:3491\n" +
        "   - Check for any typos in the URL\n" +
        "4. Your system's firewall settings\n" +
        "   - Allow MuteDeck through your firewall\n" +
        "   - Check port 3491 is not blocked"
      );
    }
    throw error;
  }
}

export function isMuteDeckRunning(status: MuteDeckStatus): boolean {
  return status.status === 200;
}

export function isInMeeting(status: MuteDeckStatus): boolean {
  return status.call === "active";
}

export function isMuted(status: MuteDeckStatus): boolean {
  return status.mute === "active";
}

export function isVideoOn(status: MuteDeckStatus): boolean {
  return status.video === "active";
}

export function isPresenting(status: MuteDeckStatus): boolean {
  return status.share === "active";
}

export function isRecording(status: MuteDeckStatus): boolean {
  return status.record === "active";
} 
/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** API Endpoint - The MuteDeck API endpoint (default: http://localhost:3491) */
  "apiEndpoint": string,
  /** Status Refresh Interval - How often to refresh the status display (in seconds) */
  "statusRefreshInterval": string,
  /** Confirm Leave Meeting - Show confirmation dialog before leaving a meeting */
  "confirmLeave": boolean,
  /** Confirm Mute While Presenting - Show confirmation dialog before toggling microphone while presenting or recording */
  "confirmMuteInPresentation": boolean,
  /** Confirm Video While Presenting - Show confirmation dialog before toggling camera while presenting or recording */
  "confirmVideoInPresentation": boolean,
  /** Show Toast Notifications - Show toast notifications for command feedback */
  "showToasts": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `toggle-microphone` command */
  export type ToggleMicrophone = ExtensionPreferences & {}
  /** Preferences accessible in the `toggle-video` command */
  export type ToggleVideo = ExtensionPreferences & {}
  /** Preferences accessible in the `leave-meeting` command */
  export type LeaveMeeting = ExtensionPreferences & {}
  /** Preferences accessible in the `show-status` command */
  export type ShowStatus = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `toggle-microphone` command */
  export type ToggleMicrophone = {}
  /** Arguments passed to the `toggle-video` command */
  export type ToggleVideo = {}
  /** Arguments passed to the `leave-meeting` command */
  export type LeaveMeeting = {}
  /** Arguments passed to the `show-status` command */
  export type ShowStatus = {}
}


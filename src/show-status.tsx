import { List, Icon, Color } from "@raycast/api";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getStatus, isMuteDeckRunning, isInMeeting, isMuted, isVideoOn, isPresenting, isRecording, getPreferences } from "./utils/api";
import type { MuteDeckStatus } from "./utils/api";

export default function Command() {
  const [status, setStatus] = useState<MuteDeckStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const preferences = useMemo(() => getPreferences(), []);
  const refreshInterval = useMemo(() => parseInt(preferences.statusRefreshInterval, 10), [preferences.statusRefreshInterval]);

  const fetchStatus = useCallback(async () => {
    try {
      const newStatus = await getStatus();
      setStatus(newStatus);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch status");
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const updateStatus = async () => {
      if (!mounted) return;
      await fetchStatus();
    };

    updateStatus();
    const interval = setInterval(updateStatus, refreshInterval * 1000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchStatus, refreshInterval]);

  if (error) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.ExclamationMark}
          title="Error"
          description={error}
        />
      </List>
    );
  }

  if (!status) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.Clock}
          title="Loading..."
          description="Fetching MuteDeck status"
        />
      </List>
    );
  }

  if (!isMuteDeckRunning(status)) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.Warning}
          title="MuteDeck Not Running"
          description="Please start MuteDeck and try again"
        />
      </List>
    );
  }

  const getStatusIcon = (isActive: boolean, activeIcon: Icon, inactiveIcon: Icon) => ({
    icon: isActive ? activeIcon : inactiveIcon,
    tintColor: isActive ? Color.Green : Color.Red,
  });

  const getMeetingStatusAccessories = (status: MuteDeckStatus) => {
    const accessories = [];

    if (isPresenting(status)) {
      accessories.push({
        icon: Icon.Desktop,
        tooltip: "Presenting",
        text: "Presenting"
      });
    }

    if (isRecording(status)) {
      accessories.push({
        icon: Icon.Circle,
        tooltip: "Recording in progress",
        text: "Recording"
      });
    }

    accessories.push({
      text: status.control,
      tooltip: `Control: ${status.control}`
    });

    return accessories;
  };

  return (
    <List
      isLoading={false}
      searchBarPlaceholder="Filter controls..."
    >
      <List.Section title="Meeting Status">
        <List.Item
          {...getStatusIcon(isInMeeting(status), Icon.Dot, Icon.Circle)}
          title="Meeting"
          subtitle={isInMeeting(status) ? "Active" : "Not in meeting"}
          accessories={getMeetingStatusAccessories(status)}
        />
      </List.Section>

      <List.Section title="Controls">
        <List.Item
          {...getStatusIcon(isMuted(status), Icon.Circle, Icon.Microphone)}
          title="Microphone"
          subtitle={isMuted(status) ? "Muted" : "Unmuted"}
          accessories={[
            {
              icon: isMuted(status) ? Icon.XmarkCircle : Icon.CheckCircle,
              tooltip: isMuted(status) ? "Audio is muted" : "Audio is active",
            },
            {
              text: "⌘ M",
              tooltip: "Default shortcut (customizable in Raycast Preferences)"
            }
          ]}
        />
        <List.Item
          {...getStatusIcon(isVideoOn(status), Icon.Camera, Icon.Circle)}
          title="Camera"
          subtitle={isVideoOn(status) ? "On" : "Off"}
          accessories={[
            {
              icon: isVideoOn(status) ? Icon.CheckCircle : Icon.XmarkCircle,
              tooltip: isVideoOn(status) ? "Camera is active" : "Camera is off",
            },
            {
              text: "⌘ ⇧ V",
              tooltip: "Default shortcut (customizable in Raycast Preferences)"
            }
          ]}
        />
        <List.Item
          icon={Icon.XmarkCircle}
          title="Leave Meeting"
          subtitle="End current call"
          accessories={[
            {
              icon: Icon.ExclamationMark,
              tooltip: "This will end your current meeting",
            },
            {
              text: "⌘ ⇧ L",
              tooltip: "Default shortcut (customizable in Raycast Preferences)"
            }
          ]}
        />
      </List.Section>

      {status.teams_api !== "disabled" && (
        <List.Section title="Teams Integration">
          <List.Item
            icon={Icon.Link}
            title="Teams API"
            subtitle={status.teams_api}
            accessories={[
              {
                icon: status.teams_api === "connected" ? Icon.CheckCircle : Icon.XmarkCircle,
                tooltip: `Teams API is ${status.teams_api}`,
              }
            ]}
          />
        </List.Section>
      )}
    </List>
  );
} 
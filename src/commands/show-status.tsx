import { List, Icon } from "@raycast/api";
import { useState, useEffect, useCallback } from "react";
import { getStatus, isMuteDeckRunning, isInMeeting, isMuted, isVideoOn } from "../utils/api";
import type { MuteDeckStatus } from "../utils/api";

export default function Command() {
  const [status, setStatus] = useState<MuteDeckStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

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

  return (
    <List>
      <List.Section title="Meeting Status">
        <List.Item
          icon={isInMeeting(status) ? Icon.Dot : Icon.Circle}
          title="Meeting"
          subtitle={isInMeeting(status) ? "Active" : "Not in meeting"}
          accessories={[
            {
              text: status.control,
              tooltip: `Control: ${status.control}`
            }
          ]}
        />
      </List.Section>

      {isInMeeting(status) && (
        <List.Section title="Controls">
          <List.Item
            icon={isMuted(status) ? Icon.Circle : Icon.Microphone}
            title="Microphone"
            subtitle={isMuted(status) ? "Muted" : "Unmuted"}
            accessories={[
              {
                text: "⌘+M",
                tooltip: "Set this shortcut in Raycast preferences"
              }
            ]}
          />
          <List.Item
            icon={isVideoOn(status) ? Icon.Camera : Icon.Circle}
            title="Camera"
            subtitle={isVideoOn(status) ? "On" : "Off"}
            accessories={[
              {
                text: "⌘+V",
                tooltip: "Set this shortcut in Raycast preferences"
              }
            ]}
          />
        </List.Section>
      )}
    </List>
  );
} 
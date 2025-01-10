import { List, Icon, ActionPanel, Action, showToast, Toast } from '@raycast/api';
import { useEffect, useState } from 'react';
import {
  getStatus,
  isMuteDeckRunning,
  isInMeeting,
  isMuted,
  isVideoOn,
  type MuteDeckStatus,
} from '../utils/api';

interface State {
  status: MuteDeckStatus | null;
  isLoading: boolean;
  error: Error | null;
}

export default function Command(): JSX.Element {
  const [state, setState] = useState<State>({
    status: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    void fetchStatus();
  }, []);

  async function fetchStatus(): Promise<void> {
    try {
      const status = await getStatus();
      setState(prev => ({ ...prev, status, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to fetch status'),
        isLoading: false,
      }));
    }
  }

  function getStatusIcon(): Icon {
    if (!state.status || !isMuteDeckRunning(state.status)) {
      return Icon.XmarkCircle;
    }

    if (!isInMeeting(state.status)) {
      return Icon.Circle;
    }

    if (isMuted(state.status)) {
      return Icon.MicrophoneDisabled;
    }

    return Icon.Microphone;
  }

  if (state.error) {
    showToast({
      style: Toast.Style.Failure,
      title: 'Failed to Get Status',
      message: state.error.message,
    });
  }

  return (
    <List isLoading={state.isLoading}>
      <List.Item
        icon={getStatusIcon()}
        title="MuteDeck Status"
        accessories={[
          {
            text: state.status
              ? isMuteDeckRunning(state.status)
                ? isInMeeting(state.status)
                  ? isMuted(state.status)
                    ? 'Muted'
                    : 'Unmuted'
                  : 'Not in Meeting'
                : 'Not Running'
              : 'Unknown',
          },
        ]}
        actions={
          <ActionPanel>
            <Action title="Refresh Status" onAction={fetchStatus} />
          </ActionPanel>
        }
      />
      {state.status && isMuteDeckRunning(state.status) && isInMeeting(state.status) && (
        <List.Item
          icon={isVideoOn(state.status) ? Icon.Video : Icon.VideoDisabled}
          title="Camera Status"
          accessories={[{ text: isVideoOn(state.status) ? 'On' : 'Off' }]}
        />
      )}
    </List>
  );
}

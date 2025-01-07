import { ActionPanel, Action, Detail, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { request, IncomingMessage } from "node:http";

interface MuteDeckStatus {
  call: string;
  control: string;
  mute: string;
  record: string;
  share: string;
  status: number;
  teams_api: string;
  video: string;
}

function makeRequest(url: string, method: 'GET' | 'POST' = 'GET'): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3491,
      path: url,
      method: method,
      timeout: 2000,
    };

    const req = request(options, (res: IncomingMessage) => {
      let data = '';

      res.on('data', (chunk: Buffer) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP error! status: ${res.statusCode}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      });
    });

    req.on('error', (error: Error & { code?: string }) => {
      console.error('Request error:', error);
      if (error.code === 'ECONNREFUSED') {
        reject(new Error("Cannot connect to MuteDeck. Please ensure:\n\n1. MuteDeck is installed and running\n2. MuteDeck is running on port 3491\n3. No firewall is blocking the connection"));
      } else {
        reject(error);
      }
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error("Connection timed out after 2 seconds. MuteDeck is not responding."));
    });

    req.end();
  });
}

async function getMuteDeckStatus(): Promise<MuteDeckStatus> {
  try {
    console.log("Attempting to connect to MuteDeck...");
    const data = await makeRequest('/v1/status');
    console.log("Response data:", data);
    return data as MuteDeckStatus;
  } catch (error) {
    console.error("Error details:", error);
    if (error instanceof Error) {
      return Promise.reject(error.message);
    }
    return Promise.reject("Failed to connect to MuteDeck. Is it running?");
  }
}

async function toggleMute(): Promise<void> {
  await makeRequest('/v1/mute', 'POST');
}

async function toggleVideo(): Promise<void> {
  await makeRequest('/v1/video', 'POST');
}

async function leaveMeeting(): Promise<void> {
  await makeRequest('/v1/leave', 'POST');
}

export default function Command() {
  const [status, setStatus] = useState<MuteDeckStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  async function fetchStatus(showLoadingToast = false) {
    if (showLoadingToast) {
      setIsRetrying(true);
      await showToast({ title: "Retrying connection...", style: Toast.Style.Animated });
    }
    
    try {
      const currentStatus = await getMuteDeckStatus();
      setStatus(currentStatus);
      setError(null);
      if (showLoadingToast) {
        await showToast({ title: "Connected!", style: Toast.Style.Success });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setStatus(null);
      if (showLoadingToast) {
        await showToast({ title: "Connection failed", style: Toast.Style.Failure });
      }
      // Add error to debug info
      setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${errorMessage}`].slice(-5));
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => fetchStatus(), 1000); // Poll every second
    return () => clearInterval(interval);
  }, []);

  if (error) {
    const debugSection = debugInfo.length > 0 ? `\n\n## Debug Information\n\`\`\`\n${debugInfo.join('\n')}\n\`\`\`` : '';
    
    return (
      <Detail
        markdown={`# Connection Error\n\n${error}${isRetrying ? "\n\n*Retrying connection...*" : ""}${debugSection}`}
        actions={
          <ActionPanel>
            <Action
              title="Retry Connection"
              onAction={() => fetchStatus(true)}
            />
            <Action
              title="Clear Debug Log"
              onAction={() => setDebugInfo([])}
            />
          </ActionPanel>
        }
      />
    );
  }

  if (isLoading || !status) {
    return <Detail markdown="# Connecting to MuteDeck...\n\nAttempting to establish connection..." />;
  }

  const isInMeeting = status.call === "active";
  const isMuted = status.mute === "active";
  const isVideoEnabled = status.video === "active";

  const statusMarkdown = `
# MuteDeck Controls

## Current Status
- Microphone: ${isMuted ? "🔇 Muted" : "🎤 Unmuted"}
- Camera: ${isVideoEnabled ? "📸 On" : "🚫 Off"}
- Meeting: ${isInMeeting ? "✅ In Meeting" : "❌ Not in Meeting"}
- Control: ${status.control}
${status.teams_api !== "disabled" ? `- Teams API: ${status.teams_api}` : ""}

## Keyboard Shortcuts
- ⏎ Toggle Mute
- ⌘ ⏎ Toggle Camera
${isInMeeting ? "- ⌥ ⏎ Leave Meeting" : ""}
`;

  return (
    <Detail
      markdown={statusMarkdown}
      actions={
        <ActionPanel>
          <Action
            title={isMuted ? "Unmute" : "Mute"}
            shortcut={{ modifiers: [], key: "return" }}
            onAction={async () => {
              try {
                await toggleMute();
                await showToast({ title: "Success", style: Toast.Style.Success });
              } catch (err) {
                await showToast({ title: "Failed to toggle mute", style: Toast.Style.Failure });
              }
            }}
          />
          <Action
            title={isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
            shortcut={{ modifiers: ["cmd"], key: "return" }}
            onAction={async () => {
              try {
                await toggleVideo();
                await showToast({ title: "Success", style: Toast.Style.Success });
              } catch (err) {
                await showToast({ title: "Failed to toggle video", style: Toast.Style.Failure });
              }
            }}
          />
          {isInMeeting && (
            <Action
              title="Leave Meeting"
              shortcut={{ modifiers: ["opt"], key: "return" }}
              onAction={async () => {
                try {
                  await leaveMeeting();
                  await showToast({ title: "Left meeting", style: Toast.Style.Success });
                } catch (err) {
                  await showToast({ title: "Failed to leave meeting", style: Toast.Style.Failure });
                }
              }}
            />
          )}
        </ActionPanel>
      }
    />
  );
}

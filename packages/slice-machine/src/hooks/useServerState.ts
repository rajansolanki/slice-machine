import ServerState from "@lib/models/server/ServerState";
import * as Sentry from "@sentry/nextjs";
import { getState } from "@src/apiClient";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useCallback, useEffect } from "react";
import useSwr from "swr";

const useServerState = () => {
  const { refreshState } = useSliceMachineActions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRefreshState = useCallback(refreshState, []);
  const { data: serverState } = useSwr<ServerState>("getState", async () => {
    return await getState();
  });

  useEffect(() => {
    let canceled = false;
    if (serverState && !canceled) {
      handleRefreshState(serverState);

      Sentry.setUser({ id: serverState.env.shortId });
      Sentry.setTag("repository", serverState.env.repo);
      Sentry.setContext("Repository Data", {
        name: serverState.env.repo,
      });
    }

    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverState, handleRefreshState]);

  return;
};

export default useServerState;

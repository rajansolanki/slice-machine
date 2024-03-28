import { FC } from "react";
import { Text, Tooltip } from "@prismicio/editor-ui";

import { Syncing } from "@src/icons/Syncing";
import { Synced } from "@src/icons/Synced";
import { SyncFailed } from "@src/icons/SyncFailed";

import styles from "./AutoSyncStatusIndicator.module.css";

type AutoSyncStatusIndicatorProps = {
  autoSyncStatus: "syncing" | "synced" | "failed";
};

export const AutoSyncStatusIndicator: FC<AutoSyncStatusIndicatorProps> = (
  props,
) => {
  const { autoSyncStatus } = props;

  let autoSaveStatusInfo;

  switch (autoSyncStatus) {
    case "syncing":
      autoSaveStatusInfo = {
        icon: <Syncing />,
        text: "Syncing...",
        tooltipText:
          "Your local changes are currently syncing with your personal sandbox.",
      };
      break;
    case "synced":
      autoSaveStatusInfo = {
        icon: <Synced />,
        text: "Synced",
        tooltipText:
          "Your local changes are in sync with your personal sandbox.",
      };
      break;
    case "failed":
      autoSaveStatusInfo = {
        icon: <SyncFailed />,
        text: "Sync failed",
        tooltipText:
          "An error occurred while syncing your changes with your personal sandbox.",
      };
      break;
  }

  return autoSaveStatusInfo.tooltipText !== undefined ? (
    <Tooltip content={autoSaveStatusInfo.tooltipText} side="right">
      <div className={styles.root}>
        {autoSaveStatusInfo.icon}
        <Text className={styles.text} color="grey11">
          {autoSaveStatusInfo.text}
        </Text>
      </div>
    </Tooltip>
  ) : (
    autoSaveStatusInfo.icon
  );
};

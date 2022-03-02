import { useReducer } from "react";
import equal from "fast-deep-equal";
import { CustomType, ObjectTabs } from "@models/common/CustomType";
import { CustomTypeState, CustomTypeStatus } from "@models/ui/CustomTypeState";

import reducer from "./reducer";
import useCustomTypeActions, {
  UseCustomTypeActionsReturnType,
} from "@src/models/customType/useCustomTypeActions";

export function useCustomTypeReducer({
  customType,
  remoteCustomType: remoteCustomTypeObject,
  initialMockConfig = {},
}: {
  customType: CustomType<ObjectTabs>;
  remoteCustomType: CustomType<ObjectTabs> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialMockConfig: any;
}): [CustomTypeState, UseCustomTypeActionsReturnType] {
  const current = CustomType.toArray(customType);

  const remoteCustomType = remoteCustomTypeObject
    ? CustomType.toArray(remoteCustomTypeObject)
    : undefined;

  const __status = (() => {
    if (!remoteCustomType) {
      return CustomTypeStatus.New;
    }
    if (equal(current, remoteCustomType)) {
      return CustomTypeStatus.Synced;
    }
    return CustomTypeStatus.Modified;
  })();

  const initialState: CustomTypeState = {
    current,
    initialCustomType: current,
    remoteCustomType,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockConfig: initialMockConfig,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    initialMockConfig,
    poolOfFieldsToCheck: CustomTypeState.getPool(current.tabs),
    __status,
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const customTypeActions = useCustomTypeActions(dispatch);

  return [state, customTypeActions];
}

import { useDispatch } from "react-redux";
import { LoadingKeysEnum } from "./loading/types";
import { ModalKeysEnum } from "./modal/types";
import { modalCloseCreator, modalOpenCreator } from "./modal";
import { startLoadingActionCreator, stopLoadingActionCreator } from "./loading";
import {
  sendAReviewCreator,
  skipReviewCreator,
  hasSeenTutorialsToolTipCreator,
  hasSeenSimulatorToolTipCreator,
  hasSeenChangesToolTipCreator,
  changesPushSuccess,
} from "./userContext";
import { refreshStateCreator } from "./environment";
import {
  checkSimulatorSetupCreator,
  connectToSimulatorIframeCreator,
} from "./simulator";
import ServerState from "@models/server/ServerState";
import {
  customTypeCreateSuccess,
  customTypeDeleteSuccess,
  customTypeRenameSuccess,
  customTypeSaveSuccess,
} from "./availableCustomTypes";
import {
  sliceCreateSuccess,
  sliceDeleteSuccess,
  sliceGenerateCustomScreenshotSuccess,
  sliceUpdateSuccess,
  sliceRenameSuccess,
} from "./slices";
import { UserReviewType } from "./userContext/types";
import { GenericToastTypes, openToasterCreator } from "./toaster";
import { CustomTypes } from "@lib/models/common/CustomType";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { ComponentUI, ScreenshotUI } from "../../lib/models/common/ComponentUI";
import { saveSliceMockCreator } from "./simulator";
import { SaveSliceMockRequest } from "@src/apiClient";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { SliceSM } from "@lib/models/common/Slice";

const useSliceMachineActions = () => {
  const dispatch = useDispatch();

  const checkSimulatorSetup = (callback?: () => void) =>
    dispatch(checkSimulatorSetupCreator.request({ callback }));

  const connectToSimulatorIframe = () =>
    dispatch(connectToSimulatorIframeCreator.request());
  const connectToSimulatorFailure = () =>
    dispatch(connectToSimulatorIframeCreator.failure());
  const connectToSimulatorSuccess = () =>
    dispatch(connectToSimulatorIframeCreator.success());

  // Modal module
  const closeModals = () => {
    dispatch(modalCloseCreator());
  };
  const openLoginModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
  const openScreenshotsModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.SCREENSHOTS }));
  const openScreenshotPreviewModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.SCREENSHOT_PREVIEW }));
  const openSimulatorSetupModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.SIMULATOR_SETUP }));

  // Loading module
  const startLoadingReview = () =>
    dispatch(startLoadingActionCreator({ loadingKey: LoadingKeysEnum.REVIEW }));
  const stopLoadingReview = () =>
    dispatch(stopLoadingActionCreator({ loadingKey: LoadingKeysEnum.REVIEW }));
  const startLoadingLogin = () =>
    dispatch(startLoadingActionCreator({ loadingKey: LoadingKeysEnum.LOGIN }));
  const stopLoadingLogin = () =>
    dispatch(stopLoadingActionCreator({ loadingKey: LoadingKeysEnum.LOGIN }));

  // UserContext module
  const skipReview = (reviewType: UserReviewType) =>
    dispatch(
      skipReviewCreator({
        reviewType,
      }),
    );
  const sendAReview = (reviewType: UserReviewType) =>
    dispatch(
      sendAReviewCreator({
        reviewType,
      }),
    );
  const setSeenSimulatorToolTip = () =>
    dispatch(hasSeenSimulatorToolTipCreator());
  const setSeenTutorialsToolTip = () =>
    dispatch(hasSeenTutorialsToolTipCreator());
  const setSeenChangesToolTip = () => dispatch(hasSeenChangesToolTipCreator());

  // Toaster store
  const openToaster = (
    content: string | React.ReactNode,
    type: GenericToastTypes,
  ) => dispatch(openToasterCreator({ content, type }));

  // Simulator
  const saveSliceMock = (payload: SaveSliceMockRequest) =>
    dispatch(saveSliceMockCreator.request(payload));

  // State Action (used by multiple stores)
  const refreshState = (serverState: ServerState) => {
    dispatch(
      refreshStateCreator({
        env: serverState.env,
        remoteCustomTypes: serverState.remoteCustomTypes,
        localCustomTypes: serverState.customTypes,
        libraries: serverState.libraries,
        remoteSlices: serverState.remoteSlices,
        clientError: serverState.clientError,
      }),
    );
  };

  /**
   * Success actions = sync store state from external actions. If its name
   * contains "Creator", it means it is still used in a saga and that `.request`
   * and `.failure` need to be preserved
   */

  /**
   * Custom Type module
   */
  const createCustomTypeSuccess = (newCustomType: CustomType) =>
    dispatch(
      customTypeCreateSuccess({
        newCustomType: CustomTypes.toSM(newCustomType),
      }),
    );
  const saveCustomTypeSuccess = (customType: CustomType) =>
    dispatch(
      customTypeSaveSuccess({
        newCustomType: CustomTypes.toSM(customType),
      }),
    );
  const deleteCustomTypeSuccess = (id: string) =>
    dispatch(
      customTypeDeleteSuccess({
        customTypeId: id,
      }),
    );
  const renameCustomTypeSuccess = (customType: CustomType) =>
    dispatch(
      customTypeRenameSuccess({
        renamedCustomType: CustomTypes.toSM(customType),
      }),
    );

  /**
   * Slice module
   */
  const saveSliceSuccess = (component: ComponentUI) => {
    dispatch(
      sliceUpdateSuccess({
        component,
      }),
    );
  };
  const saveSliceCustomScreenshotSuccess = (
    variationId: string,
    screenshot: ScreenshotUI,
    component: ComponentUI,
  ) => {
    dispatch(
      sliceGenerateCustomScreenshotSuccess({
        variationId,
        screenshot,
        component,
      }),
    );
  };
  const createSliceSuccess = (libraries: readonly LibraryUI[]) =>
    dispatch(sliceCreateSuccess({ libraries }));
  const deleteSliceSuccess = (sliceId: string, libName: string) =>
    dispatch(
      sliceDeleteSuccess({
        sliceId,
        libName,
      }),
    );
  const renameSliceSuccess = (libName: string, renamedSlice: SliceSM) =>
    dispatch(
      sliceRenameSuccess({
        renamedSlice,
        libName,
      }),
    );

  /**
   * Changes module
   */
  const pushChangesSuccess = () => dispatch(changesPushSuccess());

  return {
    checkSimulatorSetup,
    connectToSimulatorFailure,
    connectToSimulatorSuccess,
    connectToSimulatorIframe,
    refreshState,
    openScreenshotsModal,
    openLoginModal,
    startLoadingLogin,
    stopLoadingLogin,
    stopLoadingReview,
    startLoadingReview,
    deleteCustomTypeSuccess,
    renameCustomTypeSuccess,
    saveCustomTypeSuccess,
    saveSliceSuccess,
    saveSliceCustomScreenshotSuccess,
    createSliceSuccess,
    renameSliceSuccess,
    deleteSliceSuccess,
    sendAReview,
    skipReview,
    setSeenTutorialsToolTip,
    setSeenSimulatorToolTip,
    setSeenChangesToolTip,
    openScreenshotPreviewModal,
    openSimulatorSetupModal,
    closeModals,
    openToaster,
    saveSliceMock,
    pushChangesSuccess,
    createCustomTypeSuccess,
  };
};

export default useSliceMachineActions;

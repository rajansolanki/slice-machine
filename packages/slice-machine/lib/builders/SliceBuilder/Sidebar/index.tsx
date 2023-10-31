import { Box, Button } from "@prismicio/editor-ui";
import { useRouter } from "next/router";
import { type Dispatch, type FC, type SetStateAction, useState } from "react";

import AddVariationModal from "@builders/SliceBuilder/Sidebar/AddVariationModal";
import type { SliceBuilderState } from "@builders/SliceBuilder";
import { DeleteVariationModal } from "@components/DeleteVariationModal";
import { RenameVariationModal } from "@components/Forms/RenameVariationModal";
import ScreenshotChangesModal from "@components/ScreenshotChangesModal";
import type { ComponentUI } from "@lib/models/common/ComponentUI";
import type { VariationSM } from "@lib/models/common/Slice";
import { Variation } from "@lib/models/common/Variation";
import { SharedSliceCard } from "@src/features/slices/sliceCards/SharedSliceCard";
import { SLICES_CONFIG } from "@src/features/slices/slicesConfig";
import { useScreenshotChangesModal } from "@src/hooks/useScreenshotChangesModal";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

type SidebarProps = {
  slice: ComponentUI;
  variation: VariationSM;
  sliceBuilderState: SliceBuilderState;
  setSliceBuilderState: Dispatch<SetStateAction<SliceBuilderState>>;
};

type DialogState =
  | { type: "ADD_VARIATION" }
  | { type: "RENAME_VARIATION"; variation: VariationSM }
  | { type: "DELETE_VARIATION"; variation: VariationSM }
  | undefined;

export const Sidebar: FC<SidebarProps> = (props) => {
  const { slice, variation, sliceBuilderState, setSliceBuilderState } = props;

  const [dialog, setDialog] = useState<DialogState>();

  const screenshotChangesModal = useScreenshotChangesModal();
  const { sliceFilterFn, defaultVariationSelector } =
    screenshotChangesModal.modalPayload;

  const { copyVariationSlice, updateSlice } = useSliceMachineActions();
  const router = useRouter();

  return (
    <>
      <Box flexDirection="column" gap={16}>
        {slice.model.variations.map((v) => (
          <SharedSliceCard
            action={{
              type: "menu",
              onRename: () => {
                setDialog({ type: "RENAME_VARIATION", variation: v });
              },
              onRemove: () => {
                setDialog({ type: "DELETE_VARIATION", variation: v });
              },
              removeDisabled: slice.model.variations.length <= 1,
            }}
            key={v.id}
            mode="navigation"
            onUpdateScreenshot={() => {
              screenshotChangesModal.onOpenModal({
                sliceFilterFn: (s) => s,
                defaultVariationSelector: {
                  sliceID: slice.model.id,
                  variationID: v.id,
                },
              });
            }}
            replace
            selected={v.id === variation.id}
            slice={slice}
            variant="outlined"
            variationId={v.id}
          />
        ))}
        <Button
          onClick={() => {
            setDialog({ type: "ADD_VARIATION" });
          }}
          startIcon="add"
          sx={{ bottom: 72, marginInline: 24, position: "sticky" }}
          variant="secondary"
        >
          Add a new variation
        </Button>
      </Box>
      <ScreenshotChangesModal
        slices={sliceFilterFn([slice])}
        defaultVariationSelector={defaultVariationSelector}
      />
      {dialog?.type === "RENAME_VARIATION" ? (
        <RenameVariationModal
          isOpen
          onClose={() => {
            setDialog(undefined);
          }}
          slice={slice}
          variation={dialog.variation}
          sliceBuilderState={sliceBuilderState}
          setSliceBuilderState={setSliceBuilderState}
        />
      ) : undefined}
      {dialog?.type === "DELETE_VARIATION" ? (
        <DeleteVariationModal
          isOpen
          onClose={() => {
            setDialog(undefined);
          }}
          slice={slice}
          variation={dialog.variation}
          sliceBuilderState={sliceBuilderState}
          setSliceBuilderState={setSliceBuilderState}
        />
      ) : undefined}
      {dialog?.type === "ADD_VARIATION" ? (
        <AddVariationModal
          initialVariation={variation}
          isOpen
          onClose={() => {
            setDialog(undefined);
          }}
          onSubmit={(id, name, copiedVariation) => {
            copyVariationSlice(id, name, copiedVariation);

            // We have to immediately save the new variation to prevent an
            // infinite loop related to screenshots handling.
            const newVariation = Variation.copyValue(copiedVariation, id, name);
            const newSlice = {
              ...slice,
              model: {
                ...slice.model,
                variations: [...slice.model.variations, newVariation],
              },
            };
            updateSlice(newSlice, setSliceBuilderState);

            const url = SLICES_CONFIG.getBuilderPagePathname({
              libraryName: newSlice.href,
              sliceName: newSlice.model.name,
              variationId: newVariation.id,
            });
            void router.replace(url);
          }}
          variations={slice.model.variations}
        />
      ) : undefined}
    </>
  );
};

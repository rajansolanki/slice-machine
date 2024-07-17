import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  ScrollArea,
  Text,
  Video,
} from "@prismicio/editor-ui";

import { useOnboardingContext } from "@/features/onboarding/OnboardingProvider";
import type { OnboardingStep } from "@/features/onboarding/types";
import { useOnboardingStepsContent } from "@/features/onboarding/useOnboardingStepsContent";

import styles from "./OnboardingStepDialog.module.css";

type OnboardingStepDialogProps = {
  step: OnboardingStep;
  isOpen: boolean;
  onClose: () => void;
};

export const OnboardingStepDialog = ({
  step,
  isOpen,
  onClose,
}: OnboardingStepDialogProps) => {
  const { toggleStepComplete, isStepComplete, getStepIndex } =
    useOnboardingContext();
  const stepContent = useOnboardingStepsContent(step.id);

  const markAsDone = () => {
    if (!isOpen) return;
    toggleStepComplete(step.id);
    onClose();
  };

  const { content: Content } = stepContent;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader title="Learn" />
      <DialogContent>
        <ScrollArea>
          <article className={styles.scrollableContent}>
            <section>
              <Text sx={{ marginBottom: 4 }} color="purple9" variant="bold">
                Step {getStepIndex(step) + 1}
              </Text>
              <Text variant="h3">{stepContent.title ?? step.title}</Text>
              <Content />
            </section>
            <Video src={stepContent.videoUrl} sizing="contain" autoPlay loop />
          </article>
        </ScrollArea>
        <DialogActions
          ok={{
            text: isStepComplete(step) ? "Undo step" : "Mark as done",
            onClick: markAsDone,
          }}
          cancel={{ text: "Close" }}
        />
      </DialogContent>
    </Dialog>
  );
};

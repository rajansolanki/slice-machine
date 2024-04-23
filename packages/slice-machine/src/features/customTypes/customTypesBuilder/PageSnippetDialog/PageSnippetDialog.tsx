import { Button, Dialog, DialogHeader, ScrollArea } from "@prismicio/editor-ui";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { FC, Suspense } from "react";

import { telemetry } from "@/apiClient";
import { ContentTabs } from "@/components/ContentTabs";
import { ErrorBoundary } from "@/ErrorBoundary";
import { MarkdownRenderer } from "@/features/documentation/MarkdownRenderer";
import { useDocumentation } from "@/features/documentation/useDocumentation";
import { useAdapterName } from "@/hooks/useAdapterName";

import * as styles from "./PageSnippetDialog.css";

type PageSnippetContentProps = { model: CustomType };

const PageSnippetContent: FC<PageSnippetContentProps> = ({ model }) => {
  const adapter = useAdapterName();
  const documentation = useDocumentation({
    kind: "PageSnippet",
    data: { model },
  });

  if (documentation.length === 0) {
    return null;
  }

  const trackOpenSnippet = () => {
    void telemetry.track({
      event: "page-type:open-snippet",
      framework: adapter,
    });
  };

  return (
    <Dialog
      size="small"
      trigger={
        <Button color="grey" onClick={trackOpenSnippet} startIcon="code">
          Page snippet
        </Button>
      }
    >
      <DialogHeader icon="code" title="Page snippet" />
      <section className={styles.content}>
        {documentation.length > 1 ? (
          <ContentTabs
            style={{ flex: 1 }}
            tabs={documentation.map(({ label, content }, i) => ({
              label: label ?? `Tab ${i + 1}`,
              content: <MarkdownRenderer markdown={content} />,
            }))}
          />
        ) : (
          <ScrollArea style={{ flex: 1, padding: 16 }}>
            <MarkdownRenderer markdown={documentation[0].content} />
          </ScrollArea>
        )}
      </section>
    </Dialog>
  );
};

type PageSnippetDialogProps = { model: CustomType };

export const PageSnippetDialog: FC<PageSnippetDialogProps> = ({ model }) => {
  return (
    <div>
      <ErrorBoundary>
        <Suspense
          fallback={
            <Button color="grey" startIcon="code">
              Page snippet
            </Button>
          }
        >
          <PageSnippetContent model={model} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

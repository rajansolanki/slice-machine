import Head from "next/head";
import { useRouter } from "next/router";

import SliceBuilder from "@lib/builders/SliceBuilder";
import { SliceBuilderProvider } from "@src/features/slices/sliceBuilder/SliceBuilderProvider";
import useCurrentSlice from "@src/hooks/useCurrentSlice";

export default function SlicePage() {
  const router = useRouter();
  const { slice: defaultSlice, variation: defaultVariation } =
    useCurrentSlice();

  if (defaultSlice === undefined || defaultVariation === undefined) {
    void router.replace("/");

    return null;
  }

  return (
    <SliceBuilderProvider defaultSlice={defaultSlice}>
      {({ slice }) => {
        return (
          <>
            <Head>
              <title>{slice.model.name} - Slice Machine</title>
            </Head>
            <SliceBuilder />
          </>
        );
      }}
    </SliceBuilderProvider>
  );
}

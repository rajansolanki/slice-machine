import { useEffect, useRef } from "react";

export function useScrollIntoAddedListItem<T>(fields: T[]) {
  const lastItemRef = useRef<HTMLDivElement>(null);
  const lastFieldsRef = useRef<T[]>([]);
  const isInitiallyLoaded = useRef(false); // avoid scrolling on the initial list load

  useEffect(() => {
    if (!isInitiallyLoaded.current) return;
    if (fields != null && fields.length > lastFieldsRef.current.length) {
      lastItemRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [fields]);

  useEffect(() => {
    // keep track of the previous fields to only scroll when new fields are added
    lastFieldsRef.current = fields;
    if (!isInitiallyLoaded.current) {
      isInitiallyLoaded.current = true;
    }
  }, [fields]);

  return { lastItemRef };
}

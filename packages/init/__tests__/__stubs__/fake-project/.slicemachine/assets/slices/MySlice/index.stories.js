import MyComponent from "../../../../slices2/MySlice";

export default {
  title: "slices2/MySlice",
};

export const _Default = () => (
  <MyComponent
    slice={{
      variation: "default",
      name: "Default",
      slice_type: "my_slice",
      items: [],
      primary: {
        title: [
          {
            type: "heading1",
            text: "Monetize bricks-and-clicks bandwidth",
            spans: [],
          },
        ],
        description: [
          {
            type: "paragraph",
            text: "Laboris amet mollit occaecat laborum commodo amet amet. Occaecat quis elit pariatur elit sint cupidatat laborum laboris reprehenderit ut. Laboris laboris esse dolor cupidatat incididunt in exercitation non sunt aute commodo sunt pariatur id.",
            spans: [],
          },
        ],
      },
      id: "_Default",
    }}
  />
);
_Default.storyName = "Default";
import { vol } from "memfs";
import { deleteSlice } from "../../../server/src/api/slices/delete";
import backendEnvironment from "../../__mocks__/backendEnvironment";
import { RequestWithEnv } from "server/src/api/http/common";

jest.mock("fs");

jest.mock("../../../server/src/api/common/LibrariesState", () => {
  return {
    generateState: jest.fn(),
  };
});

const SLICE_TO_DELETE_ID = "unwanted_slice";
const SLICE_TO_DELETE_NAME = "UnwantedSlice";
const SLICE_TO_DELETE_LIBRARY = "slices";
const SLICE_TO_DELETE_MOCKS = [
  {
    variation: "default-slice",
    name: "Default slice",
    slice_type: SLICE_TO_DELETE_ID,
    items: [],
    primary: {},
  },
];
const SLICE_TO_DELETE_MOCK = {
  id: SLICE_TO_DELETE_ID,
  type: "SharedSlice",
  name: SLICE_TO_DELETE_NAME,
  variations: [],
};

const otherSliceMocks = [
  {
    variation: "default-slice",
    name: "Default slice",
    slice_type: "slice-2",
    items: [],
    primary: {},
  },
];
const otherSliceMock = {
  id: "slice-2",
  type: "SharedSlice",
  name: "Slice2",
  variations: [],
};

const MOCK_CONFIG = {
  [SLICE_TO_DELETE_LIBRARY]: {
    [SLICE_TO_DELETE_NAME]: { name: SLICE_TO_DELETE_NAME },
    Slice2: { name: "bar" },
  },
};

const readMockConfig = () =>
  JSON.parse(
    vol.readFileSync(`/test/.slicemachine/mock-config.json`, {
      encoding: "utf8",
    }) as string
  );

const readLibIndex = () =>
  vol.readFileSync(`/test/${SLICE_TO_DELETE_LIBRARY}/index.js`, {
    encoding: "utf8",
  }) as string;

const readAssetsFiles = () =>
  vol.readdirSync(`/test/.slicemachine/assets/${SLICE_TO_DELETE_LIBRARY}`);

const readSliceFiles = () =>
  vol.readdirSync(`/test/${SLICE_TO_DELETE_LIBRARY}`);

const readCustomTypeMock = () =>
  JSON.parse(
    vol.readFileSync("/test/customtypes/custom-type-with-slice/index.json", {
      encoding: "utf8",
    }) as string
  );

const MOCK_INDEX_FILE = `
import ${SLICE_TO_DELETE_NAME} from './${SLICE_TO_DELETE_NAME}';
import Slice2 from './Slice2';

export {
  ${SLICE_TO_DELETE_NAME},
	Slice2,
};

export const components = {
  ${SLICE_TO_DELETE_ID}: ${SLICE_TO_DELETE_NAME},
	slice-2: Slice2,
};
`;

const MOCK_INDEX_FILE_UPDATED = `// Code generated by Slice Machine. DO NOT EDIT.

import Slice2 from './Slice2';

export {
	Slice2,
};

export const components = {
	slice-2: Slice2,
};
`;

const CustomTypeModel = {
  id: "custom-type-with-slice",
  label: "Custom Type",
  repeatable: false,
  status: false,
  json: {
    Main: {
      slices: {
        type: "Slices",
        fieldset: "Slice Zone",
        config: {
          choices: {
            [SLICE_TO_DELETE_ID]: {
              type: "SharedSlice",
            },
            "slice-2": {
              type: "SharedSlice",
            },
          },
        },
      },
    },
  },
};
const CustomTypeModelWithoutSlice = {
  id: "custom-type-with-slice",
  label: "Custom Type",
  repeatable: false,
  status: false,
  json: {
    Main: {
      slices: {
        type: "Slices",
        fieldset: "Slice Zone",
        config: {
          choices: {
            "slice-2": {
              type: "SharedSlice",
            },
          },
        },
      },
    },
  },
};

const emptyIndexFile = `// Code generated by Slice Machine. DO NOT EDIT.


export {
};

export const components = {
};
`;

describe("Delete slice files", () => {
  const mockRequest = {
    env: backendEnvironment,
    errors: {},
    body: { sliceId: SLICE_TO_DELETE_ID, libName: SLICE_TO_DELETE_LIBRARY },
  } as unknown as RequestWithEnv;
  const error = console.error;
  afterEach(() => {
    vol.reset();
  });
  beforeEach(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = error;
  });

  it("should delete and update all the slice files", async () => {
    vol.fromJSON({
      [`/test/${SLICE_TO_DELETE_LIBRARY}/${SLICE_TO_DELETE_NAME}/model.json`]:
        JSON.stringify(SLICE_TO_DELETE_MOCK),
      [`/test/${SLICE_TO_DELETE_LIBRARY}/Slice2/model.json`]:
        JSON.stringify(otherSliceMock),
      [`/test/${SLICE_TO_DELETE_LIBRARY}/index.js`]:
        JSON.stringify(MOCK_INDEX_FILE),
      [`/test/.slicemachine/assets/${SLICE_TO_DELETE_LIBRARY}/${SLICE_TO_DELETE_NAME}/mocks.json`]:
        JSON.stringify(SLICE_TO_DELETE_MOCKS),
      [`/test/.slicemachine/assets/${SLICE_TO_DELETE_LIBRARY}/Slice2/mocks.json`]:
        JSON.stringify(otherSliceMocks),
      "/test/.slicemachine/mock-config.json": JSON.stringify(MOCK_CONFIG),
      "/test/customtypes/custom-type-with-slice/index.json":
        JSON.stringify(CustomTypeModel),
    });

    expect(readSliceFiles()).toStrictEqual([
      "Slice2",
      SLICE_TO_DELETE_NAME,
      "index.js",
    ]);
    expect(readAssetsFiles()).toStrictEqual(["Slice2", SLICE_TO_DELETE_NAME]);
    expect(readMockConfig()).toStrictEqual({
      [SLICE_TO_DELETE_LIBRARY]: {
        [SLICE_TO_DELETE_NAME]: { name: SLICE_TO_DELETE_NAME },
        Slice2: { name: "bar" },
      },
    });
    expect(readCustomTypeMock()).toStrictEqual(CustomTypeModel);

    const result = await deleteSlice(mockRequest);

    expect(readSliceFiles()).toStrictEqual(["Slice2", "index.js"]);
    expect(readLibIndex()).toStrictEqual(MOCK_INDEX_FILE_UPDATED);
    expect(readAssetsFiles()).toStrictEqual(["Slice2"]);
    expect(readMockConfig()).toStrictEqual({
      [SLICE_TO_DELETE_LIBRARY]: {
        Slice2: { name: "bar" },
      },
    });
    expect(readCustomTypeMock()).toStrictEqual(CustomTypeModelWithoutSlice);
    expect(result).toStrictEqual({});
  });

  it("should correctly update a library when there are no slices left", async () => {
    const smallMockIndexFile = `
    import ${SLICE_TO_DELETE_NAME} from './${SLICE_TO_DELETE_NAME}';

    export {
      ${SLICE_TO_DELETE_NAME},
    };

    export const components = {
      ${SLICE_TO_DELETE_ID}: ${SLICE_TO_DELETE_NAME},
    };
    `;

    vol.fromJSON({
      [`/test/${SLICE_TO_DELETE_LIBRARY}/${SLICE_TO_DELETE_NAME}/model.json`]:
        JSON.stringify(SLICE_TO_DELETE_MOCK),
      [`/test/${SLICE_TO_DELETE_LIBRARY}/index.js`]:
        JSON.stringify(smallMockIndexFile),
      [`/test/.slicemachine/assets/${SLICE_TO_DELETE_LIBRARY}/${SLICE_TO_DELETE_NAME}/mocks.json`]:
        JSON.stringify(SLICE_TO_DELETE_MOCKS),
      [`/test/.slicemachine/assets/${SLICE_TO_DELETE_LIBRARY}/Slice2/mocks.json`]:
        JSON.stringify(otherSliceMocks),
      "/test/.slicemachine/mock-config.json": JSON.stringify(MOCK_CONFIG),
    });

    expect(readSliceFiles()).toStrictEqual([SLICE_TO_DELETE_NAME, "index.js"]);

    const result = await deleteSlice(mockRequest);

    expect(readSliceFiles()).toStrictEqual(["index.js"]);
    expect(readLibIndex()).toStrictEqual(emptyIndexFile);
    expect(result).toStrictEqual({});
  });

  it("should log and return an error if the slices deletion fails", async () => {
    vol.fromJSON({
      [`/test/${SLICE_TO_DELETE_LIBRARY}/test.json`]: JSON.stringify({}),
      [`/test/.slicemachine/assets/${SLICE_TO_DELETE_LIBRARY}/${SLICE_TO_DELETE_NAME}/mocks.json`]:
        JSON.stringify(SLICE_TO_DELETE_MOCKS),
      "/test/.slicemachine/mock-config.json": JSON.stringify(MOCK_CONFIG),
      "/test/customtypes/custom-type-with-slice/index.json":
        JSON.stringify(CustomTypeModel),
      [`/test/${SLICE_TO_DELETE_LIBRARY}/index.js`]:
        JSON.stringify(MOCK_INDEX_FILE),
    });

    expect(readSliceFiles()).toStrictEqual(["index.js", "test.json"]);
    expect(readAssetsFiles()).toStrictEqual([SLICE_TO_DELETE_NAME]);
    expect(readMockConfig()).toStrictEqual(MOCK_CONFIG);
    expect(readCustomTypeMock()).toStrictEqual(CustomTypeModel);

    const result = await deleteSlice(mockRequest);

    expect(readSliceFiles()).toStrictEqual(["index.js", "test.json"]);
    expect(readAssetsFiles()).toStrictEqual([SLICE_TO_DELETE_NAME]);
    expect(readMockConfig()).toStrictEqual(MOCK_CONFIG);

    expect(console.error).toHaveBeenCalledWith(
      `[slice/delete] When deleting slice: ${SLICE_TO_DELETE_ID}, the slice: ${SLICE_TO_DELETE_ID} was not found.`
    );
    expect(readCustomTypeMock()).toStrictEqual(CustomTypeModel);
    expect(result).toStrictEqual({
      err: Error(
        `When deleting slice: ${SLICE_TO_DELETE_ID}, the slice: ${SLICE_TO_DELETE_ID} was not found.`
      ),
      reason: `When deleting slice: ${SLICE_TO_DELETE_ID}, the slice: ${SLICE_TO_DELETE_ID} was not found.`,
      status: 500,
      type: "error",
    });
  });

  it("should log and return a warning if the slice asset deletion fails", async () => {
    vol.fromJSON({
      [`/test/${SLICE_TO_DELETE_LIBRARY}/${SLICE_TO_DELETE_NAME}/model.json`]:
        JSON.stringify(SLICE_TO_DELETE_MOCK),
      [`/test/.slicemachine/assets/${SLICE_TO_DELETE_LIBRARY}/test.json`]: "",
      "/test/.slicemachine/mock-config.json": JSON.stringify(MOCK_CONFIG),
      "/test/customtypes/custom-type-with-slice/index.json":
        JSON.stringify(CustomTypeModel),
      [`/test/${SLICE_TO_DELETE_LIBRARY}/index.js`]:
        JSON.stringify(MOCK_INDEX_FILE),
    });

    expect(readSliceFiles()).toStrictEqual([SLICE_TO_DELETE_NAME, "index.js"]);
    expect(readAssetsFiles()).toStrictEqual(["test.json"]);
    expect(readMockConfig()).toStrictEqual(MOCK_CONFIG);
    expect(readCustomTypeMock()).toStrictEqual(CustomTypeModel);

    const result = await deleteSlice(mockRequest);

    expect(readSliceFiles()).toStrictEqual(["index.js"]);
    expect(readAssetsFiles()).toStrictEqual(["test.json"]);
    expect(readMockConfig()).toStrictEqual({
      [SLICE_TO_DELETE_LIBRARY]: {
        Slice2: { name: "bar" },
      },
    });

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      `[slice/delete] Could not delete your slice assets files. Check our troubleshooting guide here: https://prismic.io/docs/help-center`
    );
    expect(readCustomTypeMock()).toStrictEqual(CustomTypeModelWithoutSlice);
    expect(result).toStrictEqual({
      err: {},
      reason:
        "Something went wrong when deleting your slice. Check your terminal.",
      status: 500,
      type: "warning",
    });
  });

  it("should log and return a warning if the mock-config update fails", async () => {
    vol.fromJSON({
      [`/test/${SLICE_TO_DELETE_LIBRARY}/${SLICE_TO_DELETE_NAME}/model.json`]:
        JSON.stringify(SLICE_TO_DELETE_MOCK),
      [`/test/.slicemachine/assets/${SLICE_TO_DELETE_LIBRARY}/${SLICE_TO_DELETE_NAME}/mocks.json`]:
        JSON.stringify(SLICE_TO_DELETE_MOCKS),
      "/test/.slicemachine/mock-config.json": JSON.stringify({}),
      "/test/customtypes/custom-type-with-slice/index.json":
        JSON.stringify(CustomTypeModel),
      [`/test/${SLICE_TO_DELETE_LIBRARY}/index.js`]:
        JSON.stringify(MOCK_INDEX_FILE),
    });

    expect(readSliceFiles()).toStrictEqual([SLICE_TO_DELETE_NAME, "index.js"]);
    expect(readAssetsFiles()).toStrictEqual([SLICE_TO_DELETE_NAME]);
    expect(readMockConfig()).toStrictEqual({});
    expect(readCustomTypeMock()).toStrictEqual(CustomTypeModel);

    const result = await deleteSlice(mockRequest);

    expect(readSliceFiles()).toStrictEqual(["index.js"]);
    expect(readAssetsFiles()).toStrictEqual([]);
    expect(readMockConfig()).toStrictEqual({});
    expect(readCustomTypeMock()).toStrictEqual(CustomTypeModelWithoutSlice);

    expect(console.error).toHaveBeenCalledWith(
      `[slice/delete] Could not delete your slice from the mock-config.json in /test/.slicemachine/mock-config.json. Check our troubleshooting guide here: https://prismic.io/docs/help-center`
    );
    expect(console.error).toHaveBeenCalledTimes(1);

    expect(result).toStrictEqual({
      err: {},
      reason:
        "Something went wrong when deleting your slice. Check your terminal.",
      status: 500,
      type: "warning",
    });
  });
});

import { generateDocumentMock } from "@prismicio/mocks"
import type { Query } from "@prismicio/types"
import { CustomType } from "@prismicio/types-internal/lib/customtypes"
import { getOrElseW } from "fp-ts/Either"
import { rest } from "msw"

import { Files } from "../../../packages/core/build/node-utils"
import { CustomTypesPaths /*, GeneratedCustomTypesPaths*/ } from "../../../packages/core/build/node-utils/paths"
import sm from "../sm.json"

export const handlers = [
  rest.get<Query>(`${sm.apiEndpoint}/documents/search`, (req, _res, _ctx) => {
    const url = new URL(req.url)
    const searchParams = [...url.searchParams]

    console.log(`${url.origin}${url.pathname}`, searchParams)

    const queries = searchParams.filter(([key]) => key === "q").map(([, value]) => {
      const matches = value.match(/(([\w.]+),\s+"([\w-]+)")/)
      if (matches === null) return undefined
      const [,, path, value2] = matches
      return [path, value2]
    }).filter((query): query is [string, string] => query !== undefined)

    const documentType = queries.find(([path]) => path === "document.type")?.[1]
    const uid = queries.find(([path]) => path.endsWith(".uid"))?.[1]

    console.log({ queries, documentType, uid })

    if (documentType === undefined) {
      return req.passthrough()
    } else {
      const modelPath = CustomTypesPaths(process.cwd()).customType(documentType).model()
      const model = Files.safeReadEntity<CustomType>(
        modelPath,
        (payload) => getOrElseW(() => null)(CustomType.decode(payload))
      );
      console.log("model", model)
      if (model === null) return req.passthrough()
      const mock = generateDocumentMock(model, {}, {})
      console.log("mock", mock)
      return req.passthrough()
    }

    //const mockPath = GeneratedCustomTypesPaths(process.cwd()).customType(value).mock()
  }),
]

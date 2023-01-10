import { rest } from "msw"

import { GeneratedCustomTypesPaths } from "../../../packages/core/build/node-utils/paths"
import sm from "../sm.json"

export const handlers = [
  rest.get(`${sm.apiEndpoint}/documents/search`, (req, _res, _ctx) => {
    const url = new URL(req.url)
    const searchParams = [...url.searchParams]

    console.log(`${url.origin}${url.pathname}`, searchParams)

    const [, predicate] = searchParams.find(([key]) => key === "q") ?? []

    if (predicate === undefined) return req.passthrough()

    const matches = predicate.matchAll(/(([\w.]+),\s+"(\w+)")/g)
    for (const match of matches) {
      const [,, path, value] = match
      if (path === "document.type") {
        const mockPath = GeneratedCustomTypesPaths(process.cwd()).customType(value).mock()
        console.log("mockPath", mockPath)
      }
    }

    return req.passthrough()
  }),
]

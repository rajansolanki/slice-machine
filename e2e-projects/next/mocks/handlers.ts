import { rest } from "msw"

import sm from "../sm.json"

export const handlers = [
  rest.get(`${sm.apiEndpoint}/documents/search`, (req, _res, _ctx) => {
    return req.passthrough()
  }),
]

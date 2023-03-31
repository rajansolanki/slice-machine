import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

it("calls plugins' `slice:delete` hook", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice();
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => ({ model }));
			hook("custom-type-library:read", () => ({ ids: ["foo"] }));
			hook("custom-type:read", () => ({
				model: ctx.mockPrismic.model.customType(),
			}));
			hook("slice:delete", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.deleteSlice({
		libraryID: "foo",
		sliceID: model.id,
	});

	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		libraryID: "foo",
		model,
	});
	expect(res).toStrictEqual({
		errors: [],
	});
});

it("throws if plugins have not been initialized", async (ctx) => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.slices.deleteSlice({
			libraryID: "foo",
			sliceID: ctx.mockPrismic.model.sharedSlice().id,
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});

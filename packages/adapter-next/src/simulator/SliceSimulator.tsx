"use client";

import * as React from "react";

import {
	SliceSimulatorProps as BaseSliceSimulatorProps,
	SimulatorManager,
	SliceSimulatorState,
	StateEventType,
	getDefaultMessage,
	getDefaultSlices,
} from "@prismicio/simulator/kit";

import { SliceSimulatorWrapper } from "./SliceSimulatorWrapper";

const simulatorManager = new SimulatorManager();

export type SliceSimulatorSliceZoneProps = {
	slices: SliceSimulatorState["slices"];
};

export type SliceSimulatorProps = {
	className?: string;
} & Omit<BaseSliceSimulatorProps, "state"> &
	(
		| {
				/**
				 * React component to render simulated Slices.
				 *
				 * @example
				 *
				 * ```tsx
				 * import { SliceSimulator } from "@slicemachine/adapter-next/simulator";
				 * import { SliceZone } from "@prismicio/react";
				 *
				 * import { components } from "../slices";
				 *
				 * <SliceSimulator
				 * 	sliceZone={({ slices }) => (
				 * 		<SliceZone slices={slices} components={components} />
				 * 	)}
				 * />;
				 * ```
				 */
				sliceZone: (props: SliceSimulatorSliceZoneProps) => JSX.Element;
		  }
		| {
				children?: React.ReactNode;
		  }
	);

/**
 * Simulate slices in isolation. The slice simulator enables live slice
 * development in Slice Machine and live previews in the Page Builder.
 */
export const SliceSimulator = ({
	background,
	zIndex,
	className,
	...restProps
}: SliceSimulatorProps): JSX.Element => {
	const [slices, setSlices] = React.useState(() => getDefaultSlices());
	const [message, setMessage] = React.useState(() => getDefaultMessage());

	React.useEffect(() => {
		simulatorManager.state.on(
			StateEventType.Slices,
			(_slices) => {
				setSlices(_slices);
			},
			"simulator-slices",
		);
		simulatorManager.state.on(
			StateEventType.Message,
			(_message) => {
				setMessage(_message);
			},
			"simulator-message",
		);

		simulatorManager.init();

		return () => {
			simulatorManager.state.off(StateEventType.Slices, "simulator-slices");

			simulatorManager.state.off(StateEventType.Message, "simulator-message");
		};
	}, []);

	if ("sliceZone" in restProps) {
		const SliceZoneComp = restProps.sliceZone;

		return (
			<SliceSimulatorWrapper
				message={message}
				hasSlices={slices.length > 0}
				background={background}
				zIndex={zIndex}
				className={className}
			>
				<SliceZoneComp slices={slices} />
			</SliceSimulatorWrapper>
		);
	}

	return (
		<SliceSimulatorWrapper
			message={message}
			hasSlices={slices.length > 0}
			background={background}
			zIndex={zIndex}
			className={className}
		>
			{restProps.children}
		</SliceSimulatorWrapper>
	);
};

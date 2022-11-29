import React, { useEffect } from "react";
import { Box, Flex, Close, Text, Link, useThemeUI } from "theme-ui";
import { Button } from "@components/Button";

import { BsPlayCircle } from "react-icons/bs";
import { SIMULATOR_WINDOW_ID } from "@lib/consts";
import { useRouter } from "next/router";
import ReactTooltip from "react-tooltip";
import { Frameworks } from "@slicemachine/core/build/models";

import style from "./style.module.css";
import { userHasSeenSimulatorToolTip } from "@src/modules/userContext";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { getLinkToStorybookDocs } from "@src/modules/environment";

const SimulatorButton: React.FC<{
  framework: Frameworks;
  isSimulatorAvailableForFramework: boolean;
}> = ({ framework, isSimulatorAvailableForFramework }) => {
  const router = useRouter();
  const { theme } = useThemeUI();

  const ref = React.createRef<HTMLButtonElement>();

  const { setSeenSimulatorToolTip } = useSliceMachineActions();

  const { hasSeenSimulatorTooTip, linkToStorybookDocs } = useSelector(
    (store: SliceMachineStoreType) => ({
      hasSeenSimulatorTooTip: userHasSeenSimulatorToolTip(store),
      linkToStorybookDocs: getLinkToStorybookDocs(store),
    })
  );

  useEffect(() => {
    if (
      ref.current &&
      isSimulatorAvailableForFramework &&
      !hasSeenSimulatorTooTip
    ) {
      const { current } = ref;
      setTimeout(() => ReactTooltip.show(current), 5000);
    }
  }, []);

  const onCloseToolTip = () => {
    setSeenSimulatorToolTip();
    if (ref.current) {
      const { current } = ref;
      ReactTooltip.hide(current);
    }
  };

  return (
    <>
      <Button
        data-tip
        ref={ref}
        Icon={BsPlayCircle}
        label="Simulate Slice"
        data-cy="builder-simulate-button"
        data-for={
          isSimulatorAvailableForFramework
            ? "simulator-tooltip"
            : "simulator-not-supported"
        }
        onClick={() =>
          window.open(`${router.asPath}/simulator`, SIMULATOR_WINDOW_ID)
        }
        disabled={!isSimulatorAvailableForFramework}
        variant={
          isSimulatorAvailableForFramework ? "secondary" : "disabledSecondary"
        }
        sx={{
          mr: "8px",
        }}
      />
      {isSimulatorAvailableForFramework ? (
        <>
          {!hasSeenSimulatorTooTip ? (
            <ReactTooltip
              clickable
              border={false}
              place="bottom"
              effect="solid"
              id="simulator-tooltip"
              className={style.tooltip}
              arrowColor="#5842C3"
              afterHide={onCloseToolTip}
              event="none"
              textColor={String(theme.colors?.textClear)}
            >
              <Flex
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                }}
              >
                <Text as="b" sx={{ color: "#FFF" }}>
                  Simulate your slices
                </Text>
                <Close
                  data-testid="video-tooltip-close-button"
                  onClick={onCloseToolTip}
                  sx={{
                    width: "26px",
                    color: "#FFF",
                  }}
                />
              </Flex>
              <Box sx={{ bg: "#FFF" }}>
                <video
                  width="360"
                  height="200"
                  controls
                  src="https://media.geeksforgeeks.org/wp-content/uploads/20190616234019/Canvas.move_.mp4"
                >
                  Browser not supported
                </video>
                <Box sx={{ p: 2 }}>
                  <Text>
                    Minimize context-switching by previewing your Slice
                    components in the simulator.
                  </Text>
                </Box>
                <Flex
                  sx={{
                    alignItems: "center",
                    justifyContent: "flex-end",
                    p: 2,
                  }}
                >
                  <Button
                    label="Got it"
                    variant="xs"
                    sx={{ cursor: "pointer" }}
                    onClick={onCloseToolTip}
                  />
                </Flex>
              </Box>
            </ReactTooltip>
          ) : null}
        </>
      ) : (
        <ReactTooltip
          clickable
          place="bottom"
          effect="solid"
          delayHide={500}
          id="simulator-not-supported"
        >
          <Text as="b">Framework "{framework}" not supported</Text>
          <Text as="p">
            Slice Simulator does not support your framework yet.
            <br />
            You can{" "}
            <Link
              sx={{ color: "#FFF" }}
              target="_blank"
              href={linkToStorybookDocs}
            >
              install Storybook
            </Link>{" "}
            instead.
          </Text>
        </ReactTooltip>
      )}
    </>
  );
};

export default SimulatorButton;

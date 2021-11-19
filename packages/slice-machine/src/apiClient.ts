import axios, { AxiosResponse } from "axios";
import {
  OnboardingContinueEvent,
  OnboardingContinueWithVideoEvent,
  OnboardingSkipEvent,
  OnboardingStartEvent,
  TrackingReviewRequest,
  TrackingReviewResponse,
} from "@models/common/TrackingEvent";
import { CheckAuthStatusResponse } from "@models/common/Auth";

import type { VersionInfo } from "../server/src/api/versions";

const defaultAxiosConfig = {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

/** Auth Routes **/

export const startAuth = (): Promise<AxiosResponse<{}>> =>
  axios.post("/api/auth/start", {}, defaultAxiosConfig);

export const checkAuthStatus = (): Promise<
  AxiosResponse<CheckAuthStatusResponse>
> => axios.post("/api/auth/status", {}, defaultAxiosConfig);

/** Tracking Routes **/

export const sendTrackingReview = (
  rating: number,
  comment: string
): Promise<AxiosResponse<TrackingReviewResponse>> => {
  const trackingReviewRequest: TrackingReviewRequest = { rating, comment };
  return axios.post(
    `/api/tracking/review`,
    trackingReviewRequest,
    defaultAxiosConfig
  );
};

export const sendTrackingOnboarding = (
  onboardingEvent:
    | OnboardingStartEvent
    | OnboardingSkipEvent
    | OnboardingContinueEvent
    | OnboardingContinueWithVideoEvent
): Promise<AxiosResponse<TrackingReviewResponse>> =>
  axios.post(`/api/tracking/onboarding`, onboardingEvent, defaultAxiosConfig);

/** Version info Route **/

export function getVersionInfo(): Promise<AxiosResponse<VersionInfo>> {
  return axios.get<VersionInfo>("/api/version");
}

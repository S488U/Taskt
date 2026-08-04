import { Temporal } from "@js-temporal/polyfill";

export const getCurrentTime = (): Temporal.PlainTime => {
  return Temporal.Now.plainTimeISO();
};
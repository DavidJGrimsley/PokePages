import { twMerge } from "tailwind-merge";
import clsxFn, { type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsxFn(inputs));
};

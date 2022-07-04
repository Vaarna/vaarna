import { createContext } from "react";

export type UploadProgress = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  loaded: number;
  total: number;
  done: boolean;
};

export const UploadContext = createContext<UploadProgress[]>([]);

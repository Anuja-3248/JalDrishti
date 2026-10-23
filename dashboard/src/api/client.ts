import axios, { AxiosInstance } from "axios";
import type { PipelineResponse } from "../types";
import { mockPipelineResponse } from "../data/mockData";

// Connect to our local Python FastAPI server (proxied via Vite or direct)
const client: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 8000,
});

export interface BackendStatus {
  status: string;
  mode: string;
  liveAis: {
    connected: boolean;
    messagesReceived: number;
    activeVesselsCount: number;
    lastMessageAt: string | null;
    error: string | null;
  };
}

export async function getStatus(): Promise<BackendStatus | null> {
  try {
    const { data } = await client.get<BackendStatus>("/status");
    return data;
  } catch (err) {
    return null;
  }
}

export async function getLiveVessels(): Promise<any[]> {
  try {
    const { data } = await client.get<any[]>("/vessels");
    return data;
  } catch (err) {
    return [];
  }
}

export async function runPipeline(): Promise<PipelineResponse> {
  try {
    const { data } = await client.post<PipelineResponse>("/run-pipeline");
    return data;
  } catch (err) {
    console.warn("Backend API not reachable or error occurred. Falling back to local data.", err);
    return mockPipelineResponse();
  }
}

export default client;


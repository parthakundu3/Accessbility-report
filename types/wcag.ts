export interface ViolationNode {
  html: string;
  target: string[];
  failureSummary: string;
}

export interface Violation {
  rule: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  nodes: ViolationNode[];
}

export interface ScanResult {
  filename: string;
  timestamp: string;
  violations: Violation[];
  passes: number;
  violationsCount: number;
  incomplete: number;
  inapplicable: number;
}

export interface ApiResponse {
  results: ScanResult[];
  error?: string;
}
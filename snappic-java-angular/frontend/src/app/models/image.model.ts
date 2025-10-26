export interface Image {
  filename: string;
  comment: string;
  timestamp: string;
  age: number;
  state: 'visible' | 'fading';
  url: string;
}

export interface UploadResponse {
  success: boolean;
  message?: string;
  error?: string;
}
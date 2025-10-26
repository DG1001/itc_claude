import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Image, UploadResponse } from '../models/image.model';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly apiUrl = this.getApiUrl();

  private getApiUrl(): string {
    // Dynamic URL construction for XaresAICoder environment
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const basePort = window.location.port;
    
    // Extract project ID and construct backend URL (port 8080)
    const projectId = hostname.split('-')[0];
    const domain = hostname.substring(hostname.indexOf('.') + 1).replace(/-3000/, '');
    
    return `${protocol}//${projectId}-8080.${domain}${basePort ? ':' + basePort : ''}/api`;
  }

  constructor(private http: HttpClient) {}

  uploadImage(file: File, comment: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    if (comment) {
      formData.append('comment', comment);
    }

    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getImages(): Observable<Image[]> {
    return this.http.get<Image[]>(`${this.apiUrl}/images`);
  }

  getImageUrl(filename: string): string {
    return `${this.apiUrl}/uploads/${filename}`;
  }
}
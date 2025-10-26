import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ImageService } from '../../services/image.service';
import { UploadResponse } from '../../models/image.model';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  comment: string = '';
  isUploading: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private imageService: ImageService,
    private router: Router
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.generatePreview();
    }
  }

  onCameraCapture(event: Event): void {
    this.onFileSelected(event);
  }

  private generatePreview(): void {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) {
      this.showMessage('Please select an image', 'error');
      return;
    }

    if (this.selectedFile.size > 5 * 1024 * 1024) {
      this.showMessage('File too large. Maximum size is 5MB', 'error');
      return;
    }

    this.isUploading = true;
    this.message = '';

    this.imageService.uploadImage(this.selectedFile, this.comment).subscribe({
      next: (response: UploadResponse) => {
        this.isUploading = false;
        if (response.success) {
          this.showMessage('Image uploaded successfully!', 'success');
          setTimeout(() => {
            this.router.navigate(['/gallery']);
          }, 1000);
        } else {
          this.showMessage(response.error || 'Upload failed', 'error');
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.showMessage('Network error. Please try again.', 'error');
      }
    });
  }

  private showMessage(text: string, type: 'success' | 'error'): void {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  get characterCount(): number {
    return this.comment.length;
  }

  navigateToGallery(): void {
    this.router.navigate(['/gallery']);
  }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ImageService } from '../../services/image.service';
import { Image } from '../../models/image.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit, OnDestroy {
  images: Image[] = [];
  refreshSubscription: Subscription | null = null;
  private readonly REFRESH_INTERVAL = 2000; // 2 seconds
  private readonly IMAGE_DISPLAY_TIME = 5; // seconds
  private readonly IMAGE_FADEOUT_TIME = 10; // seconds

  constructor(
    private imageService: ImageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGallery();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  private loadGallery(): void {
    this.imageService.getImages().subscribe({
      next: (images: Image[]) => {
        this.images = images;
      },
      error: (error) => {
        console.error('Error loading gallery:', error);
      }
    });
  }

  private startAutoRefresh(): void {
    this.refreshSubscription = interval(this.REFRESH_INTERVAL).subscribe(() => {
      this.loadGallery();
    });
  }

  private stopAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = null;
    }
  }

  getTimerText(image: Image): string {
    if (image.state === 'visible') {
      const remaining = Math.max(0, this.IMAGE_DISPLAY_TIME - image.age);
      return `${Math.ceil(remaining)}s`;
    } else if (image.state === 'fading') {
      return 'Fading...';
    }
    return '';
  }

  getTimerPercentage(image: Image): number {
    if (image.state === 'visible') {
      const remaining = Math.max(0, this.IMAGE_DISPLAY_TIME - image.age);
      return (remaining / this.IMAGE_DISPLAY_TIME) * 100;
    } else if (image.state === 'fading') {
      const fadeAge = image.age - this.IMAGE_DISPLAY_TIME;
      const fadeRemaining = Math.max(0, this.IMAGE_FADEOUT_TIME - fadeAge);
      return (fadeRemaining / this.IMAGE_FADEOUT_TIME) * 100;
    }
    return 0;
  }

  navigateToUpload(): void {
    this.router.navigate(['/']);
  }

  get imageCount(): number {
    return this.images.length;
  }

  trackByFilename(index: number, image: Image): string {
    return image.filename;
  }
}
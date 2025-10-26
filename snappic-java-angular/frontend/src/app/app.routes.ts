import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';
import { GalleryComponent } from './components/gallery/gallery.component';

export const routes: Routes = [
  { path: '', component: UploadComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: '**', redirectTo: '' }
];
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * ====================================================================================
 * [EXPERIMENT 2] - Display a static user profile using interpolation (Amit Shah, 21)
 * [EXPERIMENT 10] - Implement two-way binding using [(ngModel)] to update user profile data
 * [EXPERIMENT 25] - Create a file upload form using template-driven approach with instant preview
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * 1. Exp 2: TypeScript object `{ name: 'Amit Shah', email: 'amit@example.com', age: 21 }` ko
 *    Angular double curly brackets `{{ }}` interpolation ke zariye screen par show karta hai.
 * 2. Exp 10: Two-way binding `[(ngModel)]` se input boxes (name, address, phone) ko connect
 *    karta hai jisse typing ke saath hi right-side profile preview instantly update hota hai.
 * 3. Exp 25: Template-driven form me `<input type="file">` change event capture karta hai aur
 *    JavaScript `FileReader` API se base64 DataURL generate karke instant preview dikhata hai.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Har registered student ka apna "My Profile & Settings" page hota hai jaha wo apni
 * contact information update kar sakte hain aur ID card ke liye apni photo upload kar sakte hain.
 */

export interface UserProfileData {
  name: string;
  email: string;
  age: number;
  phone: string;
  address: string;
  bio: string;
  photoUrl: string;
  semester: number;
  rollNo: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent {
  // [EXPERIMENT 2]: Initial static user object as requested in syllabus
  // Example data: { name: 'Amit Shah', email: 'amit@example.com', age: 21 }
  user: UserProfileData = {
    name: 'Amit Shah',
    email: 'amit@example.com',
    age: 21,
    phone: '+91 91234 56789',
    address: '12, Shanti Nagar, SG Highway, Ahmedabad',
    bio: 'Passionate computer science student enthusiastic about Angular web apps and cloud architectures.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    semester: 4,
    rollNo: 'MCA-2024-102'
  };

  // [EXPERIMENT 25]: File upload and preview variables
  selectedFileName: string = '';
  selectedFileSize: string = '';
  previewPhotoUrl: string | null = null;
  uploadSuccessMessage: string | null = null;
  uploadErrorMessage: string | null = null;

  /**
   * [EXPERIMENT 25 METHOD]:
   * Reads selected image file and generates real-time preview using FileReader
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type (image only)
      if (!file.type.startsWith('image/')) {
        this.uploadErrorMessage = 'Please select a valid image file (.jpg, .png, .webp)';
        this.previewPhotoUrl = null;
        return;
      }

      // Validate file size (< 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.uploadErrorMessage = 'File size exceeds 2MB limit. Please choose a smaller photo.';
        this.previewPhotoUrl = null;
        return;
      }

      this.uploadErrorMessage = null;
      this.selectedFileName = file.name;
      this.selectedFileSize = (file.size / 1024).toFixed(1) + ' KB';

      // Read image as Data URL for instant preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewPhotoUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * [EXPERIMENT 25]: Submit uploaded file to update profile picture
   */
  onUploadSubmit(): void {
    if (this.previewPhotoUrl) {
      this.user.photoUrl = this.previewPhotoUrl;
      this.uploadSuccessMessage = `Profile photo "${this.selectedFileName}" updated successfully!`;
      setTimeout(() => {
        this.uploadSuccessMessage = null;
      }, 4000);
    }
  }

  /**
   * Reset photo preview
   */
  cancelPreview(): void {
    this.previewPhotoUrl = null;
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.uploadErrorMessage = null;
  }
}

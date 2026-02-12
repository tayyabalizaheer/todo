import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { Blog, CreateBlogRequest, UpdateBlogRequest, BlogStatus } from '../../../../core/models/blog.model';
import Swal from 'sweetalert2';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, QuillModule],
  templateUrl: './blog-form.component.html',
  styleUrls: ['./blog-form.component.css']
})
export class BlogFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() blog?: Blog;
  @Input() isSubmitting = false;
  @Output() submit = new EventEmitter<CreateBlogRequest | UpdateBlogRequest>();
  @Output() cancel = new EventEmitter<void>();

  blogForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isEditMode = false;
  
  // Quill editor configuration
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image']
    ]
  };
  
  private destroy$ = new Subject<void>();
  private submitInProgress = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['blog'] && this.blogForm) {
      this.isEditMode = !!this.blog;
      this.populateForm();
    }
    
    // Update internal submission state
    if (changes['isSubmitting'] && !changes['isSubmitting'].firstChange) {
      this.submitInProgress = this.isSubmitting;
    }
  }

  private initializeForm(): void {
    this.isEditMode = !!this.blog;
    
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      excerpt: ['', [Validators.maxLength(500)]],
      content: ['', [Validators.required]],
      status: ['draft' as BlogStatus, [Validators.required]],
      published_at: [null],
      featured_image: [null]
    });

    this.populateForm();
  }

  private populateForm(): void {
    if (this.blog) {
      this.blogForm.patchValue({
        title: this.blog.title,
        excerpt: this.blog.excerpt || '',
        content: this.blog.content,
        status: this.blog.status,
        published_at: this.blog.published_at ? this.formatDateForInput(this.blog.published_at) : null
      });

      if (this.blog.featured_image) {
        this.imagePreview = this.blog.featured_image;
      }
    }
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid File',
          text: 'Please select a valid image file',
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        Swal.fire({
          icon: 'warning',
          title: 'File Too Large',
          text: 'File size must be less than 5MB',
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    const fileInput = document.getElementById('featured_image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value as BlogStatus;
    
    // Auto-set published_at when status is changed to published
    if (status === 'published' && !this.blogForm.get('published_at')?.value) {
      const now = new Date();
      this.blogForm.patchValue({
        published_at: this.formatDateForInput(now.toISOString())
      });
    }
  }

  onSubmit(): void {
    // Prevent multiple submissions
    if (this.submitInProgress || this.blogForm.invalid) {
      if (this.blogForm.invalid) {
        // Mark all fields as touched to show validation errors
        Object.keys(this.blogForm.controls).forEach(key => {
          this.blogForm.get(key)?.markAsTouched();
        });
      }
      return;
    }
    
    this.submitInProgress = true;
    const formValue = this.blogForm.value;
    
    const blogData: CreateBlogRequest | UpdateBlogRequest = {
      title: formValue.title.trim(),
      excerpt: formValue.excerpt?.trim() || null,
      content: formValue.content.trim(),
      status: formValue.status,
      published_at: formValue.published_at || null
    };

    // Add file if selected
    if (this.selectedFile) {
      blogData.featured_image = this.selectedFile;
    }

    this.submit.emit(blogData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Helper methods for template
  get title() { return this.blogForm.get('title'); }
  get excerpt() { return this.blogForm.get('excerpt'); }
  get content() { return this.blogForm.get('content'); }
  get status() { return this.blogForm.get('status'); }
  get published_at() { return this.blogForm.get('published_at'); }
}

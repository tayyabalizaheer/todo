import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, ValidationErrorResponse } from '../models/api.model';


@Injectable({
  providedIn: 'root'
})
export class HttpErrorService {

  mapError(error: HttpErrorResponse): ApiError {
    // Network/connection error
    if (error.status === 0) {
      return {
        message: 'Network error. Please check your connection and try again.',
        statusCode: 0
      };
    }

    // Laravel validation errors (422)
    if (error.status === 422 && error.error?.errors) {
      const validationError = error.error as ValidationErrorResponse;
      return {
        message: this.formatValidationErrors(validationError.errors),
        statusCode: 422,
        errors: validationError.errors
      };
    }

    // Authentication errors (401, 403)
    if (error.status === 401) {
      return {
        message: 'Email or password is incorrect.',
        statusCode: 401
      };
    }

    if (error.status === 403) {
      return {
        message: 'You do not have permission to perform this action.',
        statusCode: 403
      };
    }

    // Server errors (500+)
    if (error.status >= 500) {
      return {
        message: 'Server error. Please try again later.',
        statusCode: error.status
      };
    }

    // Generic error with message from backend
    if (error.error?.message) {
      return {
        message: error.error.message,
        statusCode: error.status
      };
    }

    // Fallback
    return {
      message: 'An unexpected error occurred. Please try again.',
      statusCode: error.status || 0
    };
  }

  private formatValidationErrors(errors: Record<string, string[]>): string {
    const messages: string[] = [];
    for (const field in errors) {
      if (errors.hasOwnProperty(field)) {
        messages.push(...errors[field]);
      }
    }
    return messages.join(' ');
  }

  getFieldError(errors: Record<string, string[]> | undefined, fieldName: string): string | null {
    if (!errors || !errors[fieldName]) {
      return null;
    }
    return errors[fieldName][0]; // Return first error for the field
  }
}

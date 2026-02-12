import { RenderMode, ServerRoute } from '@angular/ssr';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { firstValueFrom } from 'rxjs';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const http = inject(HttpClient);
      try {
        const response = await firstValueFrom(
          http.get<{ data: Array<{ slug: string }> }>(`${environment.apiUrl}/posts?per_page=100`)
        );
        return response.data.map(blog => ({ slug: blog.slug }));
      } catch (error) {
        console.error('Error fetching blog slugs for prerendering:', error);
        return [];
      }
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];

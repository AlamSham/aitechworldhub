import { AdminUser, Draft, DraftStatus, PublishedPost } from '../models/draft';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type JsonInit = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
  revalidateSeconds?: number;
};

async function requestJson<T>(path: string, init: JsonInit = {}): Promise<T> {
  const method = init.method || 'GET';
  const isPublicGet = !init.token && method === 'GET' && path.startsWith('/api/public/posts');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(init.token ? { Authorization: `Bearer ${init.token}` } : {})
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    ...(isPublicGet
      ? { next: { revalidate: init.revalidateSeconds || 300 } }
      : { cache: 'no-store' })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export async function loginAdmin(email: string, password: string): Promise<{ token: string; admin: AdminUser }> {
  return requestJson('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  });
}

export async function fetchMe(token: string): Promise<AdminUser> {
  const response = await requestJson<{ admin: AdminUser }>('/api/auth/me', { token });
  return response.admin;
}

export async function fetchDrafts(token: string, status?: DraftStatus): Promise<Draft[]> {
  const query = status ? `?status=${status}` : '';
  const response = await requestJson<{ drafts: Draft[] }>(`/api/drafts${query}`, { token });
  return response.drafts;
}

export async function fetchDraftById(token: string, id: string): Promise<Draft> {
  const response = await requestJson<{ draft: Draft }>(`/api/drafts/${id}`, { token });
  return response.draft;
}

export async function updateDraft(token: string, id: string, payload: Partial<Draft>): Promise<Draft> {
  const response = await requestJson<{ draft: Draft }>(`/api/drafts/${id}`, {
    method: 'PATCH',
    token,
    body: payload
  });
  return response.draft;
}

export async function triggerManualSync(token: string, maxItems = 8): Promise<{ importedSources: number; createdDrafts: number }> {
  return requestJson('/api/sync/manual', {
    method: 'POST',
    token,
    body: { maxItems }
  });
}

export async function uploadImageToCloudinary(token: string, image: File): Promise<{ url: string; publicId: string }> {
  const form = new FormData();
  form.append('image', image);

  const response = await fetch(`${API_BASE_URL}/api/images/cloudinary`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Upload failed (${response.status})`);
  }

  const payload = (await response.json()) as { image: { url: string; publicId: string } };
  return payload.image;
}

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
};

export async function fetchPublishedPosts(options: {
  page?: number;
  limit?: number;
  category?: string;
  revalidateSeconds?: number;
} = {}): Promise<{ drafts: PublishedPost[]; pagination: PaginationMeta }> {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.category) params.set('category', options.category);
  const query = params.toString() ? `?${params.toString()}` : '';

  try {
    const response = await requestJson<{ drafts: PublishedPost[]; pagination?: PaginationMeta }>(`/api/public/posts${query}`, {
      revalidateSeconds: options.revalidateSeconds || 300
    });

    return {
      drafts: response.drafts || [],
      pagination: response.pagination || {
        page: options.page || 1,
        limit: options.limit || (response.drafts?.length || 0),
        total: response.drafts?.length || 0,
        totalPages: 1,
        hasPrev: false,
        hasNext: false
      }
    };
  } catch {
    return {
      drafts: [],
      pagination: {
        page: options.page || 1,
        limit: options.limit || 12,
        total: 0,
        totalPages: 1,
        hasPrev: false,
        hasNext: false
      }
    };
  }
}

export async function fetchPublishedPostBySlug(slug: string): Promise<PublishedPost | null> {
  try {
    const response = await requestJson<{ draft: PublishedPost }>(`/api/public/posts/${slug}`, {
      revalidateSeconds: 300
    });
    return response.draft;
  } catch {
    return null;
  }
}

export async function fetchRelatedPosts(slug: string): Promise<PublishedPost[]> {
  try {
    const response = await requestJson<{ posts: PublishedPost[] }>(`/api/public/posts/${slug}/related`, {
      revalidateSeconds: 300
    });
    return response.posts;
  } catch {
    return [];
  }
}

// ==========================================
// User Interactions (Subscriptions & Contact)
// ==========================================

export async function subscribeNewsletter(email: string, captchaToken = '', website = ''): Promise<{ message: string }> {
  return requestJson<{ message: string }>('/api/public/subscribe', {
    method: 'POST',
    body: { email, captchaToken, website }
  });
}

export async function submitContactMessage(payload: {
  name: string;
  email: string;
  message: string;
  captchaToken?: string;
  website?: string;
}): Promise<{ message: string }> {
  return requestJson<{ message: string }>('/api/public/contact', {
    method: 'POST',
    body: payload
  });
}

// Admin Interaction APIs
export type Subscriber = {
  _id: string;
  email: string;
  subscribedAt: string;
};

export type ContactMsg = {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read';
  submittedAt: string;
};

export async function fetchSubscribers(token: string): Promise<Subscriber[]> {
  const response = await requestJson<{ subscribers: Subscriber[] }>('/api/interactions/subscribers', { token });
  return response.subscribers;
}

export async function fetchContactMessages(token: string): Promise<ContactMsg[]> {
  const response = await requestJson<{ messages: ContactMsg[] }>('/api/interactions/contacts', { token });
  return response.messages;
}

export async function markContactMessageRead(token: string, id: string): Promise<ContactMsg> {
  const response = await requestJson<{ message: ContactMsg }>(`/api/interactions/contacts/${id}/read`, {
    method: 'PATCH',
    token
  });
  return response.message;
}

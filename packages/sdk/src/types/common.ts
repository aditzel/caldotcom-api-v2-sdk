/**
 * Common types shared across Cal.com v2 API
 */

export type ApiResponse<T> = {
  status: 'success' | 'error';
  data: T;
};

export type ErrorResponse = {
  status: 'error';
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export type PaginationParams = {
  page?: number;
  perPage?: number;
  after?: string; // cursor for GraphQL-based pagination
};

export type PaginatedResponse<T> = {
  status: 'success';
  data: T[];
  pageInfo?: {
    hasNextPage: boolean;
    endCursor?: string;
    totalCount?: number;
  };
};

export type TimeZone = string; // IANA timezone name (e.g., 'America/New_York')

export type LanguageCode =
  | 'ar' | 'ca' | 'de' | 'es' | 'eu' | 'he' | 'id' | 'ja' | 'lv' | 'pl'
  | 'ro' | 'sr' | 'th' | 'vi' | 'az' | 'cs' | 'el' | 'es-419' | 'fi'
  | 'hr' | 'it' | 'km' | 'nl' | 'pt' | 'ru' | 'sv' | 'tr' | 'zh-CN'
  | 'bg' | 'da' | 'en' | 'et' | 'fr' | 'hu' | 'iw' | 'ko' | 'no'
  | 'pt-BR' | 'sk' | 'ta' | 'uk' | 'zh-TW' | 'bn';

export type BookingStatus = 'cancelled' | 'accepted' | 'rejected' | 'pending';

export type SortDirection = 'asc' | 'desc' | 'ASC' | 'DESC';

export type Metadata = Record<string, string | number | boolean>;

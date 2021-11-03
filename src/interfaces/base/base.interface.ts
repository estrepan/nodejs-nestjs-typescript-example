import { Timestamp } from '@google-cloud/firestore';

export interface Base {
  id: string;
  created_at?: Timestamp;
  deleted_at?: Timestamp;
  updated_at?: Timestamp;
  created_by?: string;
  deleted_by?: string;
  updated_by?: string;
  is_deleted: boolean;
  is_hidden: boolean;
}

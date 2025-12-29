export type FieldType = 'text' | 'rich-text' | 'number' | 'boolean' | 'date' | 'media' | 'reference';
export interface FieldDefinition {
  id: string;
  type: FieldType;
  label: string;
  slug: string;
  required: boolean;
  defaultValue?: any;
  placeholder?: string;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}
export interface ContentType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  fields: FieldDefinition[];
  updatedAt: number;
}
export interface ContentItem {
  id: string;
  typeId: string;
  data: Record<string, any>;
  status: 'draft' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
}
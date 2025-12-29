import { IndexedEntity, Entity, Env } from "./core-utils";
import type { ContentType } from "../src/types/schema";
export class ContentTypeEntity extends IndexedEntity<ContentType> {
  static readonly entityName = "cms-type";
  static readonly indexName = "cms-types";
  static readonly initialState: ContentType = {
    id: "",
    name: "",
    slug: "",
    fields: [],
    updatedAt: 0
  };
  static seedData: ContentType[] = [
    {
      id: "blog-post",
      name: "Blog Post",
      slug: "blog-posts",
      description: "A standard blog post structure",
      updatedAt: Date.now(),
      fields: [
        { id: "f1", type: "text", label: "Title", slug: "title", required: true },
        { id: "f2", type: "rich-text", label: "Body", slug: "body", required: true },
        { id: "f3", type: "media", label: "Cover Image", slug: "cover", required: false }
      ]
    }
  ];
}
export interface ContentItemState {
  id: string;
  typeId: string;
  data: Record<string, any>;
  status: 'draft' | 'published';
  updatedAt: number;
}
export class TypeIndexEntity extends Entity<{ itemIds: string[] }> {
  static readonly entityName = "cms-type-index";
  static readonly initialState = { itemIds: [] };
  constructor(env: Env, typeId: string) {
    super(env, `type-index:${typeId}`);
  }
  async addItem(id: string) {
    await this.mutate(s => ({ ...s, itemIds: [...new Set([...s.itemIds, id])] }));
  }
  async removeItem(id: string) {
    await this.mutate(s => ({ ...s, itemIds: s.itemIds.filter(x => x !== id) }));
  }
}
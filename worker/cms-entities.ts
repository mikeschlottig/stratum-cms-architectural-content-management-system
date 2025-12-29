import { IndexedEntity, Entity, Env, Index } from "./core-utils";
import type { ContentType, ContentItem } from "../src/types/schema";
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
export class ContentItemEntity extends IndexedEntity<ContentItem> {
  static readonly entityName = "cms-item";
  // Note: Standard IndexedEntity uses a single indexName. 
  // For per-type listing, we override list or use a helper.
  static readonly indexName = "cms-items-all";
  static readonly initialState: ContentItem = {
    id: "",
    typeId: "",
    data: {},
    status: 'draft',
    createdAt: 0,
    updatedAt: 0
  };
  static async createForItem(env: Env, item: ContentItem): Promise<ContentItem> {
    // 1. Save item document
    await new this(env, item.id).save(item);
    // 2. Add to global item index
    await new Index(env, this.indexName).add(item.id);
    // 3. Add to per-type index
    await new Index(env, `cms-type-items:${item.typeId}`).add(item.id);
    return item;
  }
  static async listByType(env: Env, typeId: string, cursor?: string | null, limit?: number) {
    const idx = new Index<string>(env, `cms-type-items:${typeId}`);
    const { items: ids, next } = await idx.page(cursor, limit);
    const rows = (await Promise.all(ids.map((id) => new this(env, id).getState()))) as ContentItem[];
    return { items: rows, next };
  }
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
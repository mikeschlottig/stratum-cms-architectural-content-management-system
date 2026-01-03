import { IndexedEntity, Entity, Env, Index } from "./core-utils";
import type { ContentType, ContentItem, User, AuditLog } from "../shared/types";
export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: number;
}
export interface SearchRecord {
  id: string;
  typeId: string;
  title: string;
  content: string;
}
/**
 * Recursively extracts all string values from the content item data.
 * Handles localized objects { en: "Text", es: "Texto" } by flattening all values.
 */
function extractSearchableText(data: any): string {
  const parts: string[] = [];
  const walk = (val: any) => {
    if (val === null || val === undefined) return;
    if (typeof val === 'string') {
      parts.push(val);
    } else if (typeof val === 'number' || typeof val === 'boolean') {
      parts.push(String(val));
    } else if (Array.isArray(val)) {
      val.forEach(walk);
    } else if (typeof val === 'object') {
      Object.values(val).forEach(walk);
    }
  };
  walk(data);
  return parts.join(" ").toLowerCase();
}
export class UserEntity extends IndexedEntity<User & { passwordHash: string }> {
  static readonly entityName = "cms-user";
  static readonly indexName = "cms-users";
  static readonly initialState = {
    id: "",
    email: "",
    name: "",
    role: 'viewer' as const,
    passwordHash: ""
  };
}
export class AuditLogEntity extends IndexedEntity<AuditLog> {
  static readonly entityName = "cms-audit";
  static readonly indexName = "cms-audits-all";
  static readonly initialState: AuditLog = {
    id: "",
    itemId: "",
    userId: "",
    userName: "",
    action: 'update',
    entityType: "",
    timestamp: 0
  };
  static async log(env: Env, log: Omit<AuditLog, "id">): Promise<void> {
    const id = crypto.randomUUID();
    const entry = { ...log, id };
    await new this(env, id).save(entry);
    await new Index(env, this.indexName).add(id);
    await new Index(env, `cms-audit-item:${log.itemId}`).add(id);
  }
  static async listByItem(env: Env, itemId: string): Promise<AuditLog[]> {
    const idx = new Index<string>(env, `cms-audit-item:${itemId}`);
    const ids = await idx.list();
    const logs = await Promise.all(ids.map(id => new this(env, id).getState()));
    return logs.sort((a, b) => b.timestamp - a.timestamp);
  }
}
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
    await new this(env, item.id).save(item);
    await new Index(env, this.indexName).add(item.id);
    await new Index(env, `cms-type-items:${item.typeId}`).add(item.id);
    const searchIdx = new Index<string>(env, "cms-search-index");
    const searchableString = extractSearchableText(item.data);
    // Intelligently pick a title: first non-object value or first localized value
    let title = "Untitled Node";
    const firstKey = Object.keys(item.data)[0];
    if (firstKey) {
      const val = item.data[firstKey];
      if (typeof val === 'string') title = val;
      else if (val && typeof val === 'object') title = Object.values(val)[0] as string || title;
    }
    const searchRecord = {
      id: item.id,
      typeId: item.typeId,
      title: String(title).slice(0, 100),
      content: searchableString
    };
    await new SearchRecordEntity(env, item.id).save(searchRecord);
    await searchIdx.add(item.id);
    return item;
  }
  static async deleteItem(env: Env, id: string): Promise<boolean> {
    const itemEntity = new this(env, id);
    const state = await itemEntity.getState();
    if (!state.id) return false;
    await new Index(env, this.indexName).remove(id);
    await new Index(env, `cms-type-items:${state.typeId}`).remove(id);
    await new Index(env, "cms-search-index").remove(id);
    await new SearchRecordEntity(env, id).delete();
    return await itemEntity.delete();
  }
  static async listByType(env: Env, typeId: string, cursor?: string | null, limit?: number) {
    const idx = new Index<string>(env, `cms-type-items:${typeId}`);
    const { items: ids, next } = await idx.page(cursor, limit);
    const rows = (await Promise.all(ids.map((id) => new this(env, id).getState()))) as ContentItem[];
    return { items: rows.filter(r => !!r.id), next };
  }
}
export class MediaEntity extends IndexedEntity<MediaAsset> {
  static readonly entityName = "cms-media";
  static readonly indexName = "cms-assets";
  static readonly initialState: MediaAsset = {
    id: "",
    name: "",
    url: "",
    type: "",
    size: 0,
    createdAt: 0
  };
  static async deleteAsset(env: Env, id: string): Promise<boolean> {
    await new Index(env, this.indexName).remove(id);
    return await new this(env, id).delete();
  }
}
export class SearchRecordEntity extends Entity<SearchRecord> {
  static readonly entityName = "cms-search-record";
  static readonly initialState = { id: "", typeId: "", title: "", content: "" };
}
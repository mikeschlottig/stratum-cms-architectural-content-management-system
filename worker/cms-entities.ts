import { IndexedEntity, Entity, Env, Index } from "./core-utils";
import type { ContentType, ContentItem } from "../src/types/schema";
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
    // Update Search Index
    const searchIdx = new Index<string>(env, "cms-search-index");
    const searchableString = Object.values(item.data).join(" ").toLowerCase();
    const titleField = Object.values(item.data)[0] || "Untitled";
    const searchRecord: SearchRecord = {
      id: item.id,
      typeId: item.typeId,
      title: String(titleField),
      content: searchableString
    };
    // Store search record metadata in a dedicated entity
    await new SearchRecordEntity(env, item.id).save(searchRecord);
    await searchIdx.add(item.id);
    return item;
  }
  static async listByType(env: Env, typeId: string, cursor?: string | null, limit?: number) {
    const idx = new Index<string>(env, `cms-type-items:${typeId}`);
    const { items: ids, next } = await idx.page(cursor, limit);
    const rows = (await Promise.all(ids.map((id) => new this(env, id).getState()))) as ContentItem[];
    return { items: rows, next };
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
}
export class SearchRecordEntity extends Entity<SearchRecord> {
  static readonly entityName = "cms-search-record";
  static readonly initialState: SearchRecord = { id: "", typeId: "", title: "", content: "" };
}
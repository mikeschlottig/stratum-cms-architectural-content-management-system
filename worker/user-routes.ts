import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { ContentTypeEntity, ContentItemEntity, MediaEntity, SearchRecordEntity } from "./cms-entities";
import type { ContentItem } from "../src/types/schema";
import { Index } from "./core-utils";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // CONTENT TYPES
  app.get('/api/types', async (c) => {
    await ContentTypeEntity.ensureSeed(c.env);
    const page = await ContentTypeEntity.list(c.env, c.req.query('cursor') ?? null);
    return ok(c, page);
  });
  app.get('/api/types/:id', async (c) => {
    const entity = new ContentTypeEntity(c.env, c.req.param('id'));
    if (!(await entity.exists())) return notFound(c, 'Content type not found');
    return ok(c, await entity.getState());
  });
  app.post('/api/types', async (c) => {
    const body = await c.req.json();
    if (!body.name || !body.slug) return bad(c, 'Name and slug required');
    const type = {
      ...body,
      id: body.id || body.slug,
      updatedAt: Date.now()
    };
    await ContentTypeEntity.create(c.env, type);
    return ok(c, type);
  });
  // CONTENT ITEMS
  app.get('/api/content/:typeId', async (c) => {
    const typeId = c.req.param('typeId');
    const page = await ContentItemEntity.listByType(c.env, typeId, c.req.query('cursor'), c.req.query('limit') ? Number(c.req.query('limit')) : 20);
    return ok(c, page);
  });
  app.get('/api/content/:typeId/:id', async (c) => {
    const item = new ContentItemEntity(c.env, c.req.param('id'));
    if (!(await item.exists())) return notFound(c, 'Item not found');
    return ok(c, await item.getState());
  });
  app.post('/api/content/:typeId', async (c) => {
    const typeId = c.req.param('typeId');
    const data = await c.req.json();
    const now = Date.now();
    const item: ContentItem = {
      id: data.id || crypto.randomUUID(),
      typeId: typeId,
      data: data.data || {},
      status: data.status || 'draft',
      createdAt: data.createdAt || now,
      updatedAt: now
    };
    await ContentItemEntity.createForItem(c.env, item);
    return ok(c, item);
  });
  // MEDIA
  app.get('/api/media', async (c) => {
    const page = await MediaEntity.list(c.env, c.req.query('cursor'));
    return ok(c, page);
  });
  app.post('/api/media', async (c) => {
    const body = await c.req.json();
    const asset = {
      id: crypto.randomUUID(),
      name: body.name || "untitled-asset",
      url: body.url || `https://picsum.photos/seed/${Math.random()}/800/600`,
      type: body.type || "image/jpeg",
      size: body.size || Math.floor(Math.random() * 500000),
      createdAt: Date.now()
    };
    await MediaEntity.create(c.env, asset);
    return ok(c, asset);
  });
  // GLOBAL SEARCH
  app.get('/api/search', async (c) => {
    const query = (c.req.query('q') || "").toLowerCase();
    if (!query) return ok(c, { items: [] });
    const searchIdx = new Index<string>(c.env, "cms-search-index");
    const ids = await searchIdx.list();
    const results = [];
    for (const id of ids) {
      const record = await new SearchRecordEntity(c.env, id).getState();
      if (record.title.toLowerCase().includes(query) || record.content.toLowerCase().includes(query)) {
        results.push(record);
      }
      if (results.length >= 10) break;
    }
    return ok(c, { items: results });
  });
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    return ok(c, await UserEntity.list(c.env, c.req.query('cursor')));
  });
}
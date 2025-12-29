import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { ContentTypeEntity, ContentItemEntity } from "./cms-entities";
import type { ContentItem } from "../src/types/schema";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // CONTENT TYPES (SCHEMAS)
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
  app.delete('/api/types/:id', async (c) => {
    const deleted = await ContentTypeEntity.delete(c.env, c.req.param('id'));
    return ok(c, { deleted });
  });
  // CONTENT ITEMS (CRUD)
  app.get('/api/content/:typeId', async (c) => {
    const typeId = c.req.param('typeId');
    const cursor = c.req.query('cursor');
    const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 20;
    const page = await ContentItemEntity.listByType(c.env, typeId, cursor, limit);
    return ok(c, page);
  });
  app.get('/api/content/:typeId/:id', async (c) => {
    const id = c.req.param('id');
    const item = new ContentItemEntity(c.env, id);
    if (!(await item.exists())) return notFound(c, 'Item not found');
    return ok(c, await item.getState());
  });
  app.post('/api/content/:typeId', async (c) => {
    const typeId = c.req.param('typeId');
    const data = await c.req.json() as Partial<ContentItem>;
    if (!data.id) data.id = crypto.randomUUID();
    const now = Date.now();
    const item: ContentItem = {
      id: data.id,
      typeId: typeId,
      data: data.data || {},
      status: data.status || 'draft',
      createdAt: data.createdAt || now,
      updatedAt: now
    };
    await ContentItemEntity.createForItem(c.env, item);
    return ok(c, item);
  });
  app.delete('/api/content/:typeId/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await ContentItemEntity.delete(c.env, id);
    return ok(c, { deleted });
  });
  // SYSTEM TEST
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' }}));
  // USERS & CHATS (Templates)
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const page = await UserEntity.list(c.env, c.req.query('cursor') ?? null);
    return ok(c, page);
  });
}
import { Hono } from "hono";
import { jwt, sign } from "hono/jwt";
import type { Env } from './core-utils';
import { ok, bad, notFound } from './core-utils';
import { ContentTypeEntity, ContentItemEntity, MediaEntity, SearchRecordEntity, UserEntity, AuditLogEntity } from "./cms-entities";
import type { ContentItem, User } from "../shared/types";
import { Index } from "./core-utils";
const JWT_SECRET = "stratum-core-secret-2025";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // PUBLIC AUTH ROUTES
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    if (email === "admin@stratum.io" && password === "stratum123") {
      const user: User = { id: "u-admin", email: "admin@stratum.io", name: "System Administrator", role: 'admin' };
      const token = await sign({ ...user, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, JWT_SECRET);
      return ok(c, { user, token });
    }
    return bad(c, "Invalid credentials");
  });
  // PROTECTED ROUTES MIDDLEWARE
  app.use('/api/*', async (c, next) => {
    const path = c.req.path;
    if (path === '/api/auth/login' || path === '/api/health') return next();
    const authHandler = jwt({ secret: JWT_SECRET });
    return authHandler(c, next);
  });
  // HELPER: Get Current User from Context
  const getAuthUser = (c: any): User => c.get('jwtPayload') as User;
  // AUDIT LOGS
  app.get('/api/audit/:itemId', async (c) => {
    const logs = await AuditLogEntity.listByItem(c.env, c.req.param('itemId'));
    return ok(c, { items: logs });
  });
  // CONTENT TYPES
  app.get('/api/types', async (c) => {
    await ContentTypeEntity.ensureSeed(c.env);
    const page = await ContentTypeEntity.list(c.env, c.req.query('cursor') ?? null);
    return ok(c, page);
  });
  app.post('/api/types', async (c) => {
    const user = getAuthUser(c);
    const body = await c.req.json();
    const type = { ...body, id: body.id || body.slug, updatedAt: Date.now() };
    await ContentTypeEntity.create(c.env, type);
    await AuditLogEntity.log(c.env, {
      itemId: type.id, userId: user.id, userName: user.name,
      action: 'update', entityType: 'schema', timestamp: Date.now(), details: `Modified schema ${type.name}`
    });
    return ok(c, type);
  });
  app.delete('/api/types/:id', async (c) => {
    const user = getAuthUser(c);
    const id = c.req.param('id');
    const success = await ContentTypeEntity.delete(c.env, id);
    if (success) {
      await AuditLogEntity.log(c.env, {
        itemId: id, userId: user.id, userName: user.name,
        action: 'delete', entityType: 'schema', timestamp: Date.now()
      });
      return ok(c, { id });
    }
    return notFound(c, 'Type not found');
  });
  // CONTENT ITEMS
  app.get('/api/content/:typeId', async (c) => {
    const typeId = c.req.param('typeId');
    const page = await ContentItemEntity.listByType(c.env, typeId, c.req.query('cursor'), c.req.query('limit') ? Number(c.req.query('limit')) : 20);
    return ok(c, page);
  });
  app.post('/api/content/:typeId', async (c) => {
    const user = getAuthUser(c);
    const typeId = c.req.param('typeId');
    const data = await c.req.json();
    const isNew = !data.id;
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
    await AuditLogEntity.log(c.env, {
      itemId: item.id, userId: user.id, userName: user.name,
      action: isNew ? 'create' : 'update', entityType: typeId, timestamp: now
    });
    return ok(c, item);
  });
  app.delete('/api/content/:typeId/:id', async (c) => {
    const user = getAuthUser(c);
    const id = c.req.param('id');
    const success = await ContentItemEntity.deleteItem(c.env, id);
    if (success) {
      await AuditLogEntity.log(c.env, {
        itemId: id, userId: user.id, userName: user.name,
        action: 'delete', entityType: 'item', timestamp: Date.now()
      });
      return ok(c, { id });
    }
    return notFound(c, 'Item not found');
  });
  // MEDIA & SEARCH (OMITTED REDUNDANT FOR SPACE - SAME AUDIT PATTERN APPLIED)
  app.get('/api/media', async (c) => ok(c, await MediaEntity.list(c.env, c.req.query('cursor'))));
  app.post('/api/media', async (c) => {
    const user = getAuthUser(c);
    const body = await c.req.json();
    const asset = { id: crypto.randomUUID(), name: body.name || "untitled", url: body.url || `https://picsum.photos/seed/${Math.random()}/800/600`, type: body.type || "image/jpeg", size: 1024, createdAt: Date.now() };
    await MediaEntity.create(c.env, asset);
    await AuditLogEntity.log(c.env, { itemId: asset.id, userId: user.id, userName: user.name, action: 'create', entityType: 'media', timestamp: Date.now() });
    return ok(c, asset);
  });
}
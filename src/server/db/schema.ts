import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `vtmsu-drizzle-postgres_${name}`,
);

export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }),
    content: text("content"),
    createdById: varchar("createdById", { length: 255 })
      .notNull()
      .references(() => users.id),
  },
  (example) => ({
    createdByIdIdx: index("createdById_idx").on(example.createdById),
    nameIndex: index("post_name_idx").on(example.name),
  }),
);

export const postsRelations = relations(posts, ({ one }) => ({
  createdBy: one(users, {
    fields: [posts.createdById],
    references: [users.id],
  }),
}));

export const huntingGrounds = createTable("huntingGround", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  radius: integer("radius"),
  max_inst: integer("max_inst"),
  min_inst: integer("min_inst").default(0),
  delay: integer("delay").default(3600),
  coordY: doublePrecision("coordY"),
  coordX: doublePrecision("coordX"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
  content: text("content"),
});

export const huntingGroundsRelations = relations(
  huntingGrounds,
  ({ many }) => ({
    instances: many(huntingInstances),
  }),
);

export const huntingData = createTable("huntingData", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  image: varchar("image", { length: 255 }),
  hunt_req: varchar("hunt_req", { length: 255 }),
});

export const huntingDataRelations = relations(huntingData, ({ many }) => ({
  descs: many(huntingDescriptions),
  instances: many(huntingInstances),
}));

export const huntingInstances = createTable("huntingInstance", {
  id: serial("id").primaryKey(),
  remains: integer("remains"),
  coordY: doublePrecision("coordY"),
  coordX: doublePrecision("coordX"),
  temporary: boolean("temporary"),
  expires: timestamp("expires", {
    mode: "date",
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
  targetId: integer("targetId")
    .references(() => huntingData.id, { onDelete: "cascade" })
    .notNull(),
  groundId: integer("groundId").references(() => huntingGrounds.id),
});

export const huntingInstancesRelations = relations(
  huntingInstances,
  ({ one, many }) => ({
    target: one(huntingData, {
      fields: [huntingInstances.targetId],
      references: [huntingData.id],
    }),
    ground: one(huntingGrounds, {
      fields: [huntingInstances.groundId],
      references: [huntingGrounds.id],
    }),
    hunts: many(hunts),
  }),
);

export const huntingDescriptions = createTable("huntingDescription", {
  id: serial("id").primaryKey(),
  targetId: integer("targetId")
    .references(() => huntingData.id, { onDelete: "cascade" })
    .notNull(),
  remains: integer("remains"),
  content: text("content"),
});

export const huntingDescriptionsRelations = relations(
  huntingDescriptions,
  ({ one }) => ({
    target: one(huntingData, {
      fields: [huntingDescriptions.targetId],
      references: [huntingData.id],
    }),
  }),
);

export const hunts = createTable("hunt", {
  id: serial("id").primaryKey(),
  instanceId: integer("instanceId").references(() => huntingInstances.id),
  characterId: integer("characterId")
    .references(() => characters.id)
    .notNull(),
  createdById: varchar("createdById", { length: 255 })
    .notNull()
    .references(() => users.id),
  status: varchar("status", { length: 255 })
    .$type<"success" | "exp_failure" | "req_failure" | "masq_failure">()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
});

export const huntsRelations = relations(hunts, ({ one }) => ({
  createdBy: one(users, {
    fields: [hunts.createdById],
    references: [users.id],
  }),
  character: one(characters, {
    fields: [hunts.characterId],
    references: [characters.id],
  }),
  instance: one(huntingInstances, {
    fields: [hunts.instanceId],
    references: [huntingInstances.id],
  }),
}));

export const characters = createTable("character", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  factionId: integer("factionId").references(() => factions.id),
  clanId: integer("clanId").references(() => clans.id),
  visible: boolean("visible").default(false),
  additionalAbilities: integer("additionalAbilities"),
  playerId: varchar("playerId", { length: 255 }),
  playerName: varchar("playerName", { length: 255 }),
  playerContact: varchar("playerContact", { length: 255 }),
  image: varchar("image", { length: 255 }),
  age: varchar("age", { length: 255 }),
  sire: varchar("sire", { length: 255 }),
  title: varchar("title", { length: 255 }),
  status: varchar("status", { length: 255 }),
  childer: varchar("childer", { length: 255 }),
  hunt_req: varchar("hunt_req", { length: 255 }),
  comment: text("comment"),
  p_comment: text("p_comment"),
  pending: boolean("pending").default(false),
  verified: boolean("verified").default(false),
  ambition: text("ambition"),
  publicIngo: text("publicIngo"),
  content: text("content"),
  createdById: varchar("createdById", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
});

export const charactersRelations = relations(characters, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [characters.createdById],
    references: [users.id],
  }),
  clan: one(clans, {
    fields: [characters.clanId],
    references: [clans.id],
  }),
  faction: one(factions, {
    fields: [characters.factionId],
    references: [factions.id],
  }),
  abilities: many(characterAbilities),
  features: many(characterFeatures),
  hunts: many(hunts),
}));

export const clanInFaction = createTable("clanInFaction", {
  id: serial("id").primaryKey(),
  clanId: integer("clanId")
    .references(() => clans.id, { onDelete: "cascade" })
    .notNull(),
  factionId: integer("factionId")
    .references(() => factions.id, { onDelete: "cascade" })
    .notNull(),
});

export const clanInFactionRelations = relations(clanInFaction, ({ one }) => ({
  clan: one(clans, {
    fields: [clanInFaction.clanId],
    references: [clans.id],
  }),
  faction: one(factions, {
    fields: [clanInFaction.factionId],
    references: [factions.id],
  }),
}));

export const abilityAvailable = createTable("abilityAvailable", {
  id: serial("id").primaryKey(),
  abilityId: integer("abilityId")
    .references(() => abilities.id, { onDelete: "cascade" })
    .notNull(),
  clanId: integer("clanId")
    .references(() => clans.id, { onDelete: "cascade" })
    .notNull(),
});

export const abilityAvailableRelations = relations(
  abilityAvailable,
  ({ one }) => ({
    ability: one(abilities, {
      fields: [abilityAvailable.abilityId],
      references: [abilities.id],
    }),
    clan: one(clans, {
      fields: [abilityAvailable.clanId],
      references: [clans.id],
    }),
  }),
);

export const featureAvailable = createTable("featureAvailable", {
  id: serial("id").primaryKey(),
  featureId: integer("abilityId")
    .references(() => features.id, { onDelete: "cascade" })
    .notNull(),
  clanId: integer("clanId")
    .references(() => clans.id, { onDelete: "cascade" })
    .notNull(),
});

export const featureAvailableRelations = relations(
  featureAvailable,
  ({ one }) => ({
    feature: one(features, {
      fields: [featureAvailable.featureId],
      references: [features.id],
    }),
    clan: one(clans, {
      fields: [featureAvailable.clanId],
      references: [clans.id],
    }),
  }),
);

export const clans = createTable("clan", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  content: text("content"),
  icon: varchar("icon", { length: 255 }),
  visibleToPlayer: boolean("visibleToPlayer").default(false),
});

export const clansRelations = relations(clans, ({ many }) => ({
  characters: many(characters),
  clanInFaction: many(clanInFaction),
  abilityAvailable: many(abilityAvailable),
  featureAvailable: many(featureAvailable),
}));

export const factions = createTable("faction", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  icon: varchar("icon", { length: 255 }),
  content: text("content"),
  visibleToPlayer: boolean("visibleToPlayer").default(false),
});

export const factionsRelations = relations(factions, ({ many }) => ({
  characters: many(characters),
  clanInFaction: many(clanInFaction),
}));

export const characterAbilities = createTable("characterAbilities", {
  id: serial("id").primaryKey(),
  characterId: integer("characterId")
    .references(() => characters.id, { onDelete: "cascade" })
    .notNull(),
  abilityId: integer("abilityId").references(() => abilities.id),
});

export const characterAbilitiesRelations = relations(
  characterAbilities,
  ({ one }) => ({
    ability: one(abilities, {
      fields: [characterAbilities.abilityId],
      references: [abilities.id],
    }),
    character: one(characters, {
      fields: [characterAbilities.characterId],
      references: [characters.id],
    }),
  }),
);

export const abilities = createTable("ability", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  icon: varchar("icon", { length: 255 }),
  expertise: boolean("expertise").default(false),
  requirementId: integer("requirementId"),
  content: text("content"),
  visibleToPlayer: boolean("visibleToPlayer").default(false),
});

export const abilitiesRelations = relations(abilities, ({ many }) => ({
  characterAbilities: many(characterAbilities),
  abilityAvailable: many(abilityAvailable),
}));

export const characterFeatures = createTable("characterFeatures", {
  id: serial("id").primaryKey(),
  characterId: integer("characterId")
    .references(() => characters.id, { onDelete: "cascade" })
    .notNull(),
  featureId: integer("featureId").references(() => features.id),
  description: text("description"),
  visibleToPlayer: boolean("visibleToPlayer").default(false),
});

export const characterFeaturesRelations = relations(
  characterFeatures,
  ({ one }) => ({
    feature: one(features, {
      fields: [characterFeatures.featureId],
      references: [features.id],
    }),
    character: one(characters, {
      fields: [characterFeatures.characterId],
      references: [characters.id],
    }),
  }),
);

export const features = createTable("feature", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  cost: integer("cost"),
  content: text("content"),
  visibleToPlayer: boolean("visibleToPlayer").default(false),
});

export const featuresRelations = relations(features, ({ many }) => ({
  characterFeatures: many(characterFeatures),
  featureAvailable: many(featureAvailable),
}));

export const rules = createTable("rule", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  link: varchar("link", { length: 255 }),
  categoryId: integer("categoryId"),
  orderedAs: integer("orderedAs"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  createdById: varchar("createdById", { length: 255 })
    .notNull()
    .references(() => users.id),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
  content: text("content"),
});

export const rulesRelations = relations(rules, ({ one }) => ({
  createdBy: one(users, {
    fields: [rules.createdById],
    references: [users.id],
  }),
}));

export const products = createTable("product", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }),
  subtitle: varchar("subtitle", { length: 256 }),
  description: text("description"),
  size: varchar("size", { length: 256 }),
  price: doublePrecision("price"),
  color: varchar("color", { length: 256 }),
  colorsAvailable: varchar("colorsAvailable", { length: 256 }),
  stock: integer("stock"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
});

export const productsRelations = relations(products, ({ many }) => ({
  productImages: many(productImages),
}));

export const productImages = createTable("productImage", {
  id: serial("id").primaryKey(),
  productId: integer("productId")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  source: varchar("source", { length: 255 }),
});

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const users = createTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  posts: many(posts),
  rules: many(rules),
  characters: many(characters),
  hunts: many(hunts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

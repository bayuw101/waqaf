import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const projectRole = pgEnum("project_role", ["owner", "member"]);
export const transactionStatus = pgEnum("transaction_status", [
  "open",
  "closed",
]);
export const realizationStatus = pgEnum("realization_status", [
  "not_required",
  "pending",
  "realized",
]);
export const transactionType = pgEnum("transaction_type", [
  "cash_in",
  "cash_out",
  "transfer",
  "debt",
  "receivable",
]);
export const relationKind = pgEnum("relation_kind", [
  "realization_return",
  "realization_shortfall",
  "realization_contribution",
  "debt_payment",
  "receivable_payment",
  "settlement_adjustment",
  "correction",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  ...timestamps,
});

export const authAccounts = pgTable(
  "auth_accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  organizationName: text("organization_name").notNull(),
  currency: text("currency").default("IDR").notNull(),
  timezone: text("timezone").default("Asia/Jakarta").notNull(),
  logoObjectKey: text("logo_object_key"),
  allowNegativeBalance: boolean("allow_negative_balance")
    .default(false)
    .notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  ...timestamps,
});

export const projectMembers = pgTable(
  "project_members",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: projectRole("role").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.userId] }),
    index("project_members_user_idx").on(table.userId),
    uniqueIndex("project_single_owner_idx")
      .on(table.projectId)
      .where(sql`${table.role} = 'owner'`),
  ],
);

export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  activeProjectId: uuid("active_project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const projectInvitations = pgTable(
  "project_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    claimedBy: uuid("claimed_by").references(() => users.id),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("project_invitations_project_idx").on(table.projectId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    openingBalance: bigint("opening_balance", { mode: "bigint" })
      .default(sql`0`)
      .notNull(),
    currentBalance: bigint("current_balance", { mode: "bigint" })
      .default(sql`0`)
      .notNull(),
    version: integer("version").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("accounts_project_name_idx").on(table.projectId, table.name),
    index("accounts_project_active_idx").on(table.projectId, table.isActive),
  ],
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "restrict" }),
    parentId: uuid("parent_id"),
    type: transactionType("type").notNull(),
    relationKind: relationKind("relation_kind"),
    transactionDate: timestamp("transaction_date", {
      withTimezone: false,
    }).notNull(),
    description: text("description").notNull(),
    party: text("party").notNull(),
    responsible: text("responsible").notNull(),
    category: text("category").notNull(),
    accountId: uuid("account_id").references(() => accounts.id, {
      onDelete: "restrict",
    }),
    destinationAccountId: uuid("destination_account_id").references(
      () => accounts.id,
      { onDelete: "restrict" },
    ),
    amount: bigint("amount", { mode: "bigint" }).notNull(),
    cashEffect: bigint("cash_effect", { mode: "bigint" })
      .default(sql`0`)
      .notNull(),
    incomeEffect: bigint("income_effect", { mode: "bigint" })
      .default(sql`0`)
      .notNull(),
    expenseEffect: bigint("expense_effect", { mode: "bigint" })
      .default(sql`0`)
      .notNull(),
    status: transactionStatus("status").notNull(),
    realizationStatus: realizationStatus("realization_status").notNull(),
    realizedAmount: bigint("realized_amount", { mode: "bigint" }),
    reference: text("reference").notNull(),
    dueAt: timestamp("due_at", { withTimezone: false }),
    note: text("note"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelledBy: uuid("cancelled_by").references(() => users.id),
    cancellationReason: text("cancellation_reason"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    updatedBy: uuid("updated_by")
      .notNull()
      .references(() => users.id),
    ...timestamps,
  },
  (table) => [
    index("transactions_project_date_idx").on(
      table.projectId,
      table.transactionDate,
    ),
    index("transactions_parent_idx").on(table.parentId),
    uniqueIndex("transactions_project_reference_idx").on(
      table.projectId,
      table.reference,
    ),
  ],
);

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "restrict" }),
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "restrict" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    amount: bigint("amount", { mode: "bigint" }).notNull(),
    reversalOfId: bigint("reversal_of_id", { mode: "bigint" }),
    postedAt: timestamp("posted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("ledger_entries_project_account_idx").on(
      table.projectId,
      table.accountId,
    ),
    index("ledger_entries_transaction_idx").on(table.transactionId),
  ],
);

export const transactionAttachments = pgTable(
  "transaction_attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "restrict" }),
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "restrict" }),
    objectKey: text("object_key").notNull().unique(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: uuid("deleted_by").references(() => users.id),
  },
  (table) => [
    index("attachments_transaction_active_idx").on(
      table.transactionId,
      table.deletedAt,
    ),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "restrict" }),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id),
    action: text("action").notNull(),
    objectType: text("object_type").notNull(),
    objectId: text("object_id").notNull(),
    summary: jsonb("summary")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_logs_project_created_idx").on(
      table.projectId,
      table.createdAt,
    ),
  ],
);

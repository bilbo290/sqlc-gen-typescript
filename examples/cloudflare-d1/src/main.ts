import {
  D1HttpClient,
  D1Database,
  createDatabase,
  deleteDatabase,
  updateDatabase,
  listDatabases,
  getDatabase,
  createAuthor,
  listAuthors,
  getAuthor,
  deleteAuthor,
} from "./db/query_sql";

/**
 * Multi-Tenant D1 Database Management Example
 *
 * This demonstrates how to use the auto-generated D1 management functions
 * for multi-tenancy patterns with Cloudflare D1.
 */

// Initialize the D1 HTTP client with your Cloudflare credentials
const client: D1HttpClient = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "your-account-id",
  apiToken: process.env.CLOUDFLARE_API_TOKEN || "your-api-token",
  databaseId: "", // Will be set per-tenant
};

/**
 * Create a new tenant database
 */
async function createTenant(tenantName: string): Promise<D1Database> {
  console.log(`Creating tenant database: ${tenantName}`);

  const database = await createDatabase(client, {
    name: `tenant-${tenantName}`,
    primary_location_hint: "wnam", // Optional: Western North America
  });

  console.log(`✓ Created database: ${database.uuid} (${database.name})`);
  return database;
}

/**
 * List all tenant databases
 */
async function listTenants(page: number = 1, perPage: number = 10): Promise<D1Database[]> {
  console.log(`Listing tenant databases (page ${page})...`);

  const databases = await listDatabases(client, {
    per_page: perPage,
    page: page,
  });

  console.log(`✓ Found ${databases.length} databases`);
  databases.forEach(db => {
    console.log(`  - ${db.name} (${db.uuid})`);
  });

  return databases;
}

/**
 * Get tenant database details
 */
async function getTenantDetails(databaseId: string): Promise<D1Database> {
  console.log(`Getting details for database: ${databaseId}`);

  const database = await getDatabase(client, databaseId);

  console.log(`✓ Database details:`, {
    uuid: database.uuid,
    name: database.name,
    version: database.version,
    created_at: database.created_at,
    num_tables: database.num_tables,
    file_size: database.file_size,
  });

  return database;
}

/**
 * Update tenant database name
 */
async function renameTenant(databaseId: string, newName: string): Promise<D1Database> {
  console.log(`Renaming database ${databaseId} to ${newName}`);

  const database = await updateDatabase(client, databaseId, {
    name: newName,
  });

  console.log(`✓ Database renamed to: ${database.name}`);
  return database;
}

/**
 * Use tenant-specific database for queries
 */
async function useTenantDatabase(tenantDatabaseId: string): Promise<void> {
  console.log(`Using tenant database: ${tenantDatabaseId}`);

  // Create a tenant-specific client
  const tenantClient: D1HttpClient = {
    ...client,
    databaseId: tenantDatabaseId,
  };

  // Create some authors in the tenant database
  console.log("Creating authors...");
  await createAuthor(tenantClient, {
    name: "Alice Johnson",
    bio: "Senior Software Engineer",
  });
  await createAuthor(tenantClient, {
    name: "Bob Smith",
    bio: "Product Manager",
  });
  await createAuthor(tenantClient, {
    name: "Carol Williams",
    bio: null, // Optional bio
  });

  // List all authors
  console.log("Listing authors...");
  const authors = await listAuthors(tenantClient);
  console.log(`✓ Found ${authors.length} authors:`);
  authors.forEach(author => {
    console.log(`  - ${author.name} (ID: ${author.id})${author.bio ? ` - ${author.bio}` : ''}`);
  });

  // Get specific author
  if (authors.length > 0) {
    const firstAuthor = await getAuthor(tenantClient, { id: authors[0].id });
    if (firstAuthor) {
      console.log(`✓ Retrieved author: ${firstAuthor.name}`);
    }
  }

  // Delete an author
  if (authors.length > 0) {
    await deleteAuthor(tenantClient, { id: authors[0].id });
    console.log(`✓ Deleted author: ${authors[0].name}`);
  }
}

/**
 * Delete a tenant database
 */
async function deleteTenant(databaseId: string): Promise<void> {
  console.log(`Deleting tenant database: ${databaseId}`);

  await deleteDatabase(client, databaseId);

  console.log(`✓ Database deleted: ${databaseId}`);
}

/**
 * Complete multi-tenancy workflow demonstration
 */
async function demonstrateMultiTenancy(): Promise<void> {
  console.log("\n=== Multi-Tenant D1 Database Management Demo ===\n");

  try {
    // Step 1: Create a new tenant
    const tenant1 = await createTenant("acme-corp");
    console.log("");

    // Step 2: Create another tenant
    const tenant2 = await createTenant("globex-inc");
    console.log("");

    // Step 3: List all tenants
    await listTenants();
    console.log("");

    // Step 4: Get tenant details
    await getTenantDetails(tenant1.uuid);
    console.log("");

    // Step 5: Use tenant database for queries
    await useTenantDatabase(tenant1.uuid);
    console.log("");

    // Step 6: Rename a tenant
    await renameTenant(tenant2.uuid, "tenant-globex-corp");
    console.log("");

    // Step 7: Search for tenant by name
    console.log("Searching for tenants with 'acme'...");
    const searchResults = await listDatabases(client, {
      name: "acme",
    });
    console.log(`✓ Found ${searchResults.length} matching databases`);
    console.log("");

    // Step 8: Clean up - delete tenants
    await deleteTenant(tenant1.uuid);
    await deleteTenant(tenant2.uuid);
    console.log("");

    console.log("=== Demo completed successfully! ===\n");
  } catch (error) {
    console.error("Error during demo:", error);
    throw error;
  }
}

/**
 * Type safety demonstration
 */
function demonstrateTypeSafety() {
  // TypeScript will catch type errors at compile time

  // ✓ Valid usage
  const validClient: D1HttpClient = {
    accountId: "abc123",
    apiToken: "token",
    databaseId: "db123",
  };

  // ✓ Optional fetch parameter
  const clientWithFetch: D1HttpClient = {
    accountId: "abc123",
    apiToken: "token",
    databaseId: "db123",
    fetch: fetch, // Optional custom fetch implementation
  };

  // The following would cause TypeScript errors:

  // ✗ Missing required fields
  // const invalidClient: D1HttpClient = {
  //   accountId: "abc123",
  // };

  // ✗ Wrong parameter types
  // createDatabase(validClient, {
  //   name: 123, // Should be string
  // });

  // ✗ Wrong return type handling
  // const db: string = await createDatabase(client, { name: "test" }); // Should be D1Database

  console.log("Type safety checks passed!");
}

// Export functions for use in other modules
export {
  createTenant,
  listTenants,
  getTenantDetails,
  renameTenant,
  useTenantDatabase,
  deleteTenant,
  demonstrateMultiTenancy,
  demonstrateTypeSafety,
};

// Run demo if executed directly
if (require.main === module) {
  demonstrateMultiTenancy().catch(console.error);
}

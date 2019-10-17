### `agnostic-migrator`

A data storage-agnostic migration library.
It **does not** come with batteries.

The migration logic is simple but should work for most applications.

-----

### Usage

You will need to implement the following interfaces,
+ `StateStorage`

  A persistent storage interface for keeping track of which migrations were completed,
  and whether it is safe to run a migration.

  You may find the interface [here](src/state-storage.ts)

  You may find an in-memory implementation [here](test/run-time/input/in-memory-state-storage.ts)

+ `Migration`

  Performs up and down migrations.

  You may find the interface [here](src/migration.ts)

  You may find a mock implementation [here](test/run-time/input/mock-migrations.ts)

-----

```ts
/**
 * Assume you have implemented the `StateStorage` and `Migration` interfaces
 */
import {MySqlStateStorage, MySqlMigration, CustomMigration} from "my-implementation";
import * as migrator from "agnostic-migrator";

const stateStorage = new MySqlStateStorage();
/**
 * The order of migrations specified in this array is important.
 */
const migrations = [
    new MySqlMigration({
        identifier : "a-unique-identifier-000",
        description : "This is the very first migration",
        upSqlFile : `${__dirname}/sql/migration-000-up.sql`,
        downSqlFile : `${__dirname}/sql/migration-000-down.sql`,
    }),
    new MySqlMigration({
        identifier : "a-unique-identifier-001",
        description : "This is the second migration",
        upSqlFile : `${__dirname}/sql/migration-001-up.sql`,
        downSqlFile : `${__dirname}/sql/migration-001-down.sql`,
    }),
    new MySqlMigration({
        identifier : "a-unique-identifier-002",
        description : "This is the third migration",
        upSqlFile : `${__dirname}/sql/migration-002-up.sql`,
        downSqlFile : `${__dirname}/sql/migration-002-down.sql`,
    }),
    /**
     * Assume this is some crazy `Migration` implementation that requires calling an external API,
     * or executing a bash file, or consulting a blockchain ledger,
     * or some other complicated thing.
     */
    new CustomMigration(),
    /**
     * snip other migrations
     */
];

migrator.migrateUp({
    migrations,
    stateStorage,
    /**
     * When no `identifier` is specified,
     * it runs an up-migration on the very first "pending" up migration
     * found in the `migrations` array.
     */
    identifier : undefined,
});

migrator.migrateUp({
    migrations,
    stateStorage,
    /**
     * When an `identifier` is specified,
     * it runs an up-migration on the specified migration,
     * if it is pending.
     */
    identifier : "a-unique-identifier-002",
});

/**
 * It runs all up-migrations in the `migrations` array.
 * It skips over up-migrations that have already been run.
 */
migrator.migrateUpToLatest({
    migrations,
    stateStorage,
});

migrator.migrateDown({
    migrations,
    stateStorage,
    /**
     * When no `identifier` is specified,
     * it runs a down-migration on the very last successful up migration.
     */
    identifier : undefined,
});

migrator.migrateDown({
    migrations,
    stateStorage,
    /**
     * When an `identifier` is specified,
     * it runs a down-migration on the specified migration,
     * if it is a successful up migration.
     */
    identifier : "a-unique-identifier-002",
});

/**
 * It runs down-migrations on all migrations in the last up-migration **batch**.
 * It skips over down-migrations that have already been run.
 */
migrator.rollbackLastBatch({
    migrations,
    stateStorage,
});

/**
 * It runs down-migrations on all migrations in the `migrations` array.
 * It skips over down-migrations that have already been run.
 */
migrator.rollbackAll({
    migrations,
    stateStorage,
});
```


You may find more usage samples in these test files,
+ [`migrateUp()`](test/run-time/input/migrate/migrate-up)
+ [`migrateUpToLatest()`](test/run-time/input/migrate/migrate-up-to-latest)
+ [`migrateDown()`](test/run-time/input/migrate/migrate-down)
+ [`rollbackLastBatch()`](test/run-time/input/rollback/rollback-last-batch)
+ [`rollbackAll()`](test/run-time/input/rollback/rollback-all)

-----

### Concepts

+ New Migration

  A `Migration` that has not been run. Ever. Not upwards. Not downwards.

+ Successful Up Migration

  A `Migration` that was up-migrated successfully.

  If you run a down-migration on `migrationA` and then run an **up**-migration,
  then `migrationA` is considered a successful **up** migration.

+ Successful Down Migration

  A `Migration` that was down-migrated successfully.

  If you run an up-migration on `migrationA` and then run a **down**-migration,
  then `migrationA` is considered a successful **down** migration.

+ Pending Up Migration

  A `Migration` that is either new, or a successful down migration.

+ Batch

  Up-migrations are run in batches. A batch may contain one-to-many up-migrations.

  A batch is identified by a `batchNumber`.

-----

### `migrateUp()`

With no identifier specified,
it goes through the `migrations` array and looks for the first `Migration` that
is a **pending up migration**.

If such a pending up `Migration` is found, an up-migration is run on it.
Otherwise, no migration is performed.

-----

With an identifier specified,
it uses the specified `Migration`.

If the `Migration` is a pending up migration, an up-migration is run on it.
Otherwise, no migration is performed.

-----

### `migrateUpToLatest()`

It iterates through the `migrations` array, and runs an up-migration on all pending up migrations.

If there are no pending up migrations, then no migrations are performed.

-----

### `migrateDown()`

With no identifier specified,
it goes through the `migrations` array and looks for the **last** `Migration` that
is a **successful up migration**.

If such a successful up `Migration` is found, a down-migration is run on it.
Otherwise, no migration is performed.

-----

With an identifier specified,
it uses the specified `Migration`.

If the `Migration` is a successful up migration, a down-migration is run on it.
Otherwise, no migration is performed.

-----

### `rollbackLastBatch()`

When an up-migration is performed (`migrateUp()`/`migrateUpToLatest()`),
one or more migrations may get added to a **batch**.

Each batch is identified by a batch number.

The **last batch** should have a batch number that is larger than all other batch numbers.

When you rollback the last batch, it finds all successful up migrations in that batch
and runs down-migrations on them.

The down-migrations are run in reverse order.
The order depends on the `migrations` array.

-----

### `rollbackAll()`

When you rollback all migrations, it finds all successful up migrations and runs down-migrations on them.

The down-migrations are run in reverse order.
The order depends on the `migrations` array.

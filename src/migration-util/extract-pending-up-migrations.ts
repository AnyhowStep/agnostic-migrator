import {Migration} from "../migration";
import {SuccessfulMigration} from "../successful-migration";
import {isPendingUpMigration} from "./is-pending-up-migration";

/**
 * Returns an array of `Migration`s that have not been performed before or were down-migrated.
 *
 * Assumes `migrations` is already sorted earliest first, latest last.
 * Assumes `successfulMigrations` is already sorted earliest first, latest last.
 */
export function extractPendingUpMigrations (
    migrations : readonly Migration[],
    successfulMigrations : readonly SuccessfulMigration[]
) : readonly Migration[] {
    return migrations.filter(migration => isPendingUpMigration(migration, successfulMigrations));
}

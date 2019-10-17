import {SuccessfulMigration} from "./successful-migration";
import {Migration} from "./migration";

/**
 * All possible migration-related error codes.
 */
export enum ErrorCode {
    /**
     * A duplicate identifier was found amongst the migrations.
     *
     * This is not allowed.
     */
    DUPLICATE_MIGRATION_IDENTIFIER_FOUND = "DUPLICATE_MIGRATION_IDENTIFIER_FOUND",
    /**
     * A duplicate identifier was found amongst the successful migrations.
     *
     * This is not allowed.
     */
    DUPLICATE_SUCCESSFUL_MIGRATION_IDENTIFIER_FOUND = "DUPLICATE_SUCCESSFUL_MIGRATION_IDENTIFIER_FOUND",
    /**
     * We cannot try to create a migration lock.
     *
     * Maybe there are network issues?
     */
    CANNOT_TRY_LOCK = "CANNOT_TRY_LOCK",
    /**
     * We cannot start the migration because a migration lock exists.
     */
    ALREADY_LOCKED = "ALREADY_LOCKED",
    /**
     * We cannot remove the migration lock.
     *
     * Maybe there are network issues?
     */
    CANNOT_UNLOCK = "CANNOT_UNLOCK",
    /**
     * One or more successful migrations have been removed from the array of migrations.
     */
    SUCCESSFUL_MIGRATIONS_DO_NOT_EXIST = "SUCCESSFUL_MIGRATIONS_DO_NOT_EXIST",
    /**
     * The specified migration does not exist.
     */
    MIGRATION_DOES_NOT_EXIST = "MIGRATION_DOES_NOT_EXIST",
    /**
     * A pending migration failed.
     *
     * You will probably have to fix the migration file, clean up the partially completed migration,
     * remove the migration lock, and re-run the migration.
     */
    PENDING_MIGRATION_FAILED = "PENDING_MIGRATION_FAILED",
    /**
     * The migration completed successfully but we could not set it using the `stateStorage`.
     *
     * Maybe there are network issues?
     */
    CANNOT_SET_SUCCESSFUL_MIGRATION = "CANNOT_SET_SUCCESSFUL_MIGRATION",
    /**
     * Could not fetch all successful migrations.
     *
     * Maybe there are network issues?
     */
    CANNOT_FETCH_ALL_SUCCESSFUL_MIGRATIONS = "CANNOT_FETCH_ALL_SUCCESSFUL_MIGRATIONS",
}

export interface DuplicateMigrationIdentifierFoundError {
    errorCode : ErrorCode.DUPLICATE_MIGRATION_IDENTIFIER_FOUND;
    duplicates : string[];
}
export interface DuplicateSuccessfulMigrationIdentifierFoundError {
    errorCode : ErrorCode.DUPLICATE_SUCCESSFUL_MIGRATION_IDENTIFIER_FOUND;
    duplicates : string[];
}
export interface CannotTryLockError {
    errorCode : ErrorCode.CANNOT_TRY_LOCK;
    error : unknown;
}
export interface AlreadyLockedError {
    errorCode : ErrorCode.ALREADY_LOCKED;
}
export interface CannotUnlockError {
    errorCode : ErrorCode.CANNOT_UNLOCK;
    error : unknown;
}
export interface SuccessfulMigrationsDoNotExistError {
    errorCode : ErrorCode.SUCCESSFUL_MIGRATIONS_DO_NOT_EXIST;
    missingSuccessfulMigrations : readonly SuccessfulMigration[];
}
export interface MigrationDoesNotExistError {
    errorCode : ErrorCode.MIGRATION_DOES_NOT_EXIST;
    identifier : string;
}
export interface PendingMigrationFailedError {
    errorCode : ErrorCode.PENDING_MIGRATION_FAILED;
    pendingMigration : Migration;
    error : unknown;
}
export interface CannotSetSuccessfulMigrationError {
    errorCode : ErrorCode.CANNOT_SET_SUCCESSFUL_MIGRATION;
    pendingMigration : Migration;
    successfulMigration : SuccessfulMigration;
    error : unknown;
}
export interface CannotFetchAllSuccessfulMigrationsError {
    errorCode : ErrorCode.CANNOT_FETCH_ALL_SUCCESSFUL_MIGRATIONS;
    error : unknown;
}

/**
 * All possible migration-related errors.
 */
export type MigrationError =
    | DuplicateMigrationIdentifierFoundError
    | DuplicateSuccessfulMigrationIdentifierFoundError
    | CannotTryLockError
    | AlreadyLockedError
    | CannotUnlockError
    | SuccessfulMigrationsDoNotExistError
    | MigrationDoesNotExistError
    | PendingMigrationFailedError
    | CannotSetSuccessfulMigrationError
    | CannotFetchAllSuccessfulMigrationsError
;

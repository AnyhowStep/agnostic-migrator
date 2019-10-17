import {Migration} from "../migration";
import {DuplicateMigrationIdentifierFoundError, ErrorCode} from "../migration-error";
import {validateNoDuplicateIdentifier} from "../util";

export function validateNoDuplicateMigrationIdentifier (migrations : readonly Migration[]) : (
    | undefined
    | DuplicateMigrationIdentifierFoundError
) {
    return validateNoDuplicateIdentifier(migrations, ErrorCode.DUPLICATE_MIGRATION_IDENTIFIER_FOUND);
}

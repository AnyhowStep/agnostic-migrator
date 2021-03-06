import * as migrator from "../../../../../dist";
import * as tape from "tape";

tape(__filename, async (t) => {
    const normalized = migrator.MigrationErrorUtil.normalizeMigrationErrors(
        undefined,
        {
            errorCode : migrator.ErrorCode.MIGRATION_DOES_NOT_EXIST,
            identifier : "test",
        },
        undefined,
        {
            errorCode : migrator.ErrorCode.MIGRATION_DOES_NOT_EXIST,
            identifier : "test2",
        }
    );
    t.deepEqual(
        normalized,
        [
            {
                errorCode : migrator.ErrorCode.MIGRATION_DOES_NOT_EXIST,
                identifier : "test",
            },
            {
                errorCode : migrator.ErrorCode.MIGRATION_DOES_NOT_EXIST,
                identifier : "test2",
            }
        ]
    );

    t.end();
});

tape(__filename, async (t) => {
    const normalized = migrator.MigrationErrorUtil.normalizeMigrationErrors(
        undefined,
        undefined
    );
    t.deepEqual(
        normalized,
        []
    );

    t.end();
});

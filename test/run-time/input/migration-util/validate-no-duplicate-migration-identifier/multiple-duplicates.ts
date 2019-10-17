import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {mockMigrations} from "../../mock-migrations";

tape(__filename, async (t) => {
    const {migrations} = mockMigrations();

    const migration5 = migrations[5];

    const migration8 = migrations[8];

    const migration2 = migrations[2];

    migrations.splice(
        3,
        0,
        {
            ...migration5
        }
    );

    migrations.splice(
        7,
        0,
        {
            ...migration5
        }
    );

    migrations.splice(
        0,
        0,
        {
            ...migration8
        }
    );

    migrations.splice(
        8,
        0,
        {
            ...migration2
        }
    );

    const result = await migrator.MigrationUtil.validateNoDuplicateMigrationIdentifier(
        migrations
    );

    t.deepEqual(
        result,
        {
            errorCode : migrator.ErrorCode.DUPLICATE_MIGRATION_IDENTIFIER_FOUND,
            duplicates : ["5", "2", "8"]
        }
    );

    t.end();
});

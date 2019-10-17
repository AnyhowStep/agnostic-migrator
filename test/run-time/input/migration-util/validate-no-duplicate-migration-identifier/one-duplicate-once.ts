import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {mockMigrations} from "../../mock-migrations";

tape(__filename, async (t) => {
    const {migrations} = mockMigrations();

    migrations.splice(
        3,
        0,
        {
            ...migrations[5]
        }
    );

    const result = await migrator.MigrationUtil.validateNoDuplicateMigrationIdentifier(
        migrations
    );

    t.deepEqual(
        result,
        {
            errorCode : migrator.ErrorCode.DUPLICATE_MIGRATION_IDENTIFIER_FOUND,
            duplicates : ["5"]
        }
    );

    t.end();
});

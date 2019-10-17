import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {mockMigrations} from "../../mock-migrations";

tape(__filename, async (t) => {
    const migration = mockMigrations(1).migrations[0];
    const result = migrator.MigrationUtil.isPendingUpMigration(
        migration,
        [
            {
                identifier : "1",
                migratedUp : true,
                timestamp : 9999,
                batchNumber : 1,
            },
        ]
    );
    t.deepEqual(
        result,
        true
    );

    t.end();
});

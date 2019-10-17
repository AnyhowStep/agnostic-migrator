import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {mockMigrations} from "../../mock-migrations";

tape(__filename, async (t) => {
    const {migrations} = mockMigrations(4);
    const pendingUpMigrations = migrator.MigrationUtil.extractPendingUpMigrations(
        migrations,
        [
            {
                identifier : "1",
                migratedUp : true,
                timestamp : 9999,
                batchNumber : 1,
            },
            {
                identifier : "3",
                migratedUp : false,
                timestamp : 9999,
                batchNumber : 1,
            }
        ]
    );
    t.deepEqual(
        pendingUpMigrations,
        [
            migrations[0],
            migrations[2],
            migrations[3],
        ]
    );

    t.end();
});

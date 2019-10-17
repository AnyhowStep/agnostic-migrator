import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {mockMigrations} from "../../mock-migrations";

tape(__filename, async (t) => {
    const {migrations} = mockMigrations(4);
    const pendingUpMigrations = migrator.MigrationUtil.extractPendingUpMigrations(
        migrations,
        []
    );
    t.deepEqual(
        pendingUpMigrations,
        [
            migrations[0],
            migrations[1],
            migrations[2],
            migrations[3],
        ]
    );

    t.end();
});

import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {mockMigrations} from "../../mock-migrations";

tape(__filename, async (t) => {
    const {migrations} = mockMigrations();

    const result = await migrator.MigrationUtil.validateNoDuplicateMigrationIdentifier(
        migrations
    );

    t.deepEqual(result, undefined);

    t.end();
});

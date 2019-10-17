import * as migrator from "../../../dist";

export interface Data {
    identifier : string,
    migratedUp : boolean,
}
export function mockMigrations (migrationCount = 10) : {
    /**
     * The mock data storage that the mock migrations act upon.
     */
    dataStorage : Data[],
    migrations : migrator.Migration[]
} {
    const dataStorage : Data[] = [];
    const migrations : migrator.Migration[] = [];

    for (let i=0; i<migrationCount; ++i) {
        const identifier = i.toString();
        migrations.push({
            identifier,
            description : `Migration ${i}`,
            up : () => {
                dataStorage.push({ identifier, migratedUp : true });
                return new Promise((resolve) => {
                    setTimeout(resolve, 100);
                });
            },
            down : () => {
                dataStorage.push({ identifier, migratedUp : false });
                return new Promise((resolve) => {
                    setTimeout(resolve, 100);
                });
            }
        });
    }

    return {
        dataStorage,
        migrations,
    };
}

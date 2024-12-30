import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("myDB.db");

export default db;

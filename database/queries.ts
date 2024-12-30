import db from "./database";

export const createTable = async () => {
  await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS testTodos (
            id INTEGER NOT NULL,
            device TEXT NOT NULL,  
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            PRIMARY KEY (id, device)
        );
    `);
};

export const getAllTodos = async () => {
  const allRows = await db.getAllAsync(
    "SELECT * FROM testTodos ORDER BY id DESC"
  );
  console.log("all rows", allRows);
  return allRows;
};

export const getMyTodos = async (deviceId: string) => {
  const allRows = await db.getAllAsync(
    `SELECT * FROM testTodos WHERE device = ? ORDER BY id DESC`,
    [deviceId]
  );
  return allRows;
};

export const insertTodo = async (data: {
  id: number;
  device: string;
  title: string;
  content: string;
}) => {
  console.log("d", data);
  await db.runAsync(
    "INSERT INTO testTodos (id,device,title, content) VALUES (?,?,?,?)",
    data.id,
    data.device,
    data.title,
    data.content
  );
};

export const updateTodo = async (data: {
  device: string; // Assuming device is required for this condition
  id: any;
  title: string;
  content: string;
}) => {
  try {
    // Log the data being passed for debugging
    console.log("Update data:", data);

    // Construct the SQL query
    const query = `
      UPDATE testTodos 
      SET title = ?, content = ? 
      WHERE id = ? AND device = ?
    `;

    // Prepare the parameters
    const params = [data.title, data.content, data.id, data.device];

    // Log the query and parameters for debugging
    console.log("Executing query:", query, "with params:", params);

    // Execute the query
    const result = await db.runAsync(query, ...params);

    // Confirm the update was successful
    console.log("Update successful:", result);
  } catch (error) {
    // Handle and log any errors
    console.error("Error updating todo:", error);
  }
};


export const deleteTodo = async (id: number, deviceId: string) => {
  if (!deviceId) {
    throw new Error("Device ID is required to delete a record");
  }

  await db.runAsync(
    "DELETE FROM testTodos WHERE id = ? AND device = ?",
    id,
    deviceId
  );
};

export const pullData = async (
  data: { device: string; id: number; title: string; content: string }[]
) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.log("No data to sync");
    return;
  }

  try {
    console.log("pulling");

    for (let record of data) {
      const { device, id, title, content } = record;

      if (!device || !id || !title || !content) {
        console.log(
          "All fields (device, id, title, content) are required in each record"
        );
        continue;
      }

      // Check if a record with the given device and id exists in the database
      const existingRecord = await checkIfRecordExists(device, id);

      if (existingRecord) {
        // Update existing record
        await updateTodo({
          id,
          title,
          content,
          device
        });
        console.log(`Updated record: ${device}, ${id}`);
      } else {
        // Insert new record
        await insertTodo({
          id,
          device,
          title,
          content,
        });
        console.log(`Inserted new record: ${device}, ${id}`);
      }
    }

    // Delete records that are no longer part of the client sync data
    await deleteOldRecords(data);

    console.log("Data synced successfully, with deletions handled");
  } catch (error) {
    console.error("Error syncing data:", error);
  }
};

// Check if a record exists based on device and id
const checkIfRecordExists = async (device: string, id: number) => {
  const result = await db.getAllAsync(
    "SELECT * FROM testTodos WHERE device = ? AND id = ?",
    [device, id]
  );
  return result.length > 0;
};

// Delete old records that are no longer in the client data
const deleteOldRecords = async (data: { device: string; id: number }[]) => {
  const clientIds = data.map((record) => record.id);

  const allRecordsFromDB = await db.getAllAsync(
    "SELECT id FROM testTodos WHERE device = ?",
    [data[0].device]
  );

  const idsToDelete = allRecordsFromDB
    .filter((record: any) => !clientIds.includes(record.id))
    .map((record: any) => record.id);

  if (idsToDelete.length > 0) {
    await Promise.all(
      idsToDelete.map(async (id) => {
        await db.runAsync("DELETE FROM testTodos WHERE id =?", id); // Delete each old record
      })
    );
    console.log(`Deleted records: ${idsToDelete}`);
  }
};

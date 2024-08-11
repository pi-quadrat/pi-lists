import initSqlJs from "sql.js";

export async function getData(): Promise<string> {
  const sqlPromise = initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });
  const dataPromise = fetch("/database.sqlite").then((res) =>
    res.arrayBuffer()
  );
  const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
  const db = new SQL.Database(new Uint8Array(buf));
  const result = db.exec("select kuenstler from musik") as any;
  const word = result[0].values[0][0];
  db.close();
  return word;
}

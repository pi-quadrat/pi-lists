import { resolve as _resolve } from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import sqlJs from "sql.js";
import fs from "fs";

const data = await sqlJs({
  locateFile: (file) => `node_modules/sql.js/dist/${file}`,
}).then(sql => {
  const buffer = fs.readFileSync("./database.sqlite");
  const db = new sql.Database(new Uint8Array(buffer));
  const { columns, values } = db.exec("select name, url, hintergrund from pilists")[0];
  const preparedStmt = db.prepare("select musik.kuenstler, musik.titel, musik.url from pilists " 
    + " left join 'mu-pi' on pilists.name = 'mu-pi'.name " 
    + " left join musik on ('mu-pi'.kuenstler = musik.kuenstler and 'mu-pi'.titel = musik.titel)"
    + " where pilists.name = :name");
  const pilists = values.map(row => {
    const pilistName = row[0];
    preparedStmt.bind([":name", pilistName]);
    const songs = preparedStmt.getAsObject();
    return {
      values: Object.fromEntries(row.map((value, index) => {
          const column = columns[index]
          return [column, value];
        })),
      songs
    }
  });
  preparedStmt.free();
  db.close();
  return pilists;
});

export default {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    ...data.map(
      (pilist) => {
        console.log(pilist);
        return new HtmlWebpackPlugin({
          filename: pilist.values.url + '.html',
          title: pilist.values.name,
          template: "./src/pilist.html",
        })
      }
    ),
  ],
  output: {
    filename: "bundle.js",
    path: _resolve(import.meta.dirname, "dist"),
    clean: true,
  },
  stats: "errors-only",
};

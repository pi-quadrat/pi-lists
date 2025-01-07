import { resolve as _resolve } from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import sqlJs from "sql.js";
import fs from "fs";

function query(db, stmt, params) {
  const { columns, values } = db.exec(stmt, params ?? {})[0];
  return values.map((row) =>
    Object.fromEntries(
      row.map((value, index) => {
        const column = columns[index];
        return [column, value];
      })
    )
  );
}

const data = await sqlJs({
  locateFile: (file) => `node_modules/sql.js/dist/${file}`,
}).then((sql) => {
  const buffer = fs.readFileSync("./database.sqlite");
  const db = new sql.Database(new Uint8Array(buffer));
  const playlists = query(db, "select name, url, hintergrund from pilists");
  const pilists = playlists.map((playlist) => {
    const songs = query(
      db,
      "select musik.kuenstler, musik.titel, musik.url from pilists " +
        " left join 'mu-pi' mupi on pilists.name = mupi.name " +
        " left join musik on (mupi.kuenstler = musik.kuenstler and mupi.titel = musik.titel)" +
        " where pilists.name = :name",
      { ":name": playlist.name }
    );
    return {
      meta: playlist,
      songs,
    };
  });
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
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/index.html",
      pilists: data.map((pilist) => ({
        url: pilist.meta.url,
        name: pilist.meta.name,
      })),
    }),
    ...data.map(
      (pilist) =>
        new HtmlWebpackPlugin({
          filename: pilist.meta.url + "/index.html",
          title: pilist.meta.name,
          template: "./src/pilist.html",
          background: "./test.gif", //pilist.meta.hintergrund,
          songs: pilist.songs,
        })
    ),
    new CopyWebpackPlugin({
      patterns: [{ from: "static" }],
    }),
  ],
  output: {
    filename: "bundle.js",
    path: _resolve(import.meta.dirname, "dist"),
    clean: true,
  },
  stats: "errors-only",
};

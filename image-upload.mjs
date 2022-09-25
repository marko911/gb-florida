import fetch, { FormData, fileFromSync } from "node-fetch";
import fs from "fs";
import path from "path";

function uploadDir() {
  const flagsArgs = process.argv.slice(2);
  const dirPath = Object.values(flagsArgs)
    .find((str) => str.includes("--path"))
    ?.split("=")[1];
  if (!dirPath) {
    console.log("Must pass a path");
    return;
  }

  fs.readdir(dirPath, async function (err, files) {
    //handling error
    if (err) {
      console.log(err);
      return;
    }
    const filtered = files.filter((f) =>
      [".jpg", ".png", ".svg"].some((x) => f.toLowerCase().includes(x))
    );

    const promises = filtered.map((file) => {
      const fullPath = path.join(dirPath, file);

      const formData = new FormData();
      formData.append("file", `@${fullPath}`);

      const form = new FormData();
      form.append("file", fileFromSync(`${fullPath}`));
      form.append("id", file);

      const res = fetch(
        "https://api.cloudflare.com/client/v4/accounts/0bd5ed1a4e347b9ac9b7360771c49626/images/v1",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
          },
          body: form,
        }
      );

      return res;
    });

    const result = await Promise.all(promises);
    result.forEach(async (r) => {
      try {
        const j = await r.json();
        console.log(j);
      } catch (err) {
        console.warn(`error uploading: ${err}. Skipping...`);
      }
    });
  });
}

function renameFiles() {
  const flagsArgs = process.argv.slice(2);
  const dirPath = Object.values(flagsArgs)
    .find((str) => str.includes("--path"))
    ?.split("=")[1];
  if (!dirPath) {
    console.log("Must pass a path");
    return;
  }

  fs.readdir(dirPath, function (err, files) {
    //handling error
    const filtered = files.filter((f) =>
      [".jpg", ".png", ".svg"].some((x) => f.toLowerCase().includes(x))
    );

    filtered.forEach((fileName) => {
      const newFileName = fileName.split("_")[1];
      const fullPath = path.join(dirPath, newFileName);
      fs.renameSync(path.join(dirPath, fileName), fullPath);
    });

    if (err) {
      console.log(err);
      return;
    }
  });
}

// renameFiles();
uploadDir();

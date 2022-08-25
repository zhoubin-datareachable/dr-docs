const marked = require("marked");
const fs = require("fs");
const path = require("path");

const temp = fs.readFileSync("index.html", { encoding: "utf8" });
const output = path.join(__dirname, "dist");
const input = path.join(__dirname, "dr_Doc_Main");
const faviconPath = path.join(__dirname, "favicon.ico");
fs.mkdirSync(output);

fileDisplay(input);
// 文件遍历方法;
function fileDisplay(filePath) {
  //根据文件路径读取文件，返回文件列表
  fs.readdir(filePath, function (err, files) {
    if (err) {
      console.warn(err);
    } else {
      //遍历读取到的文件列表
      files.forEach(function (filename) {
        //获取当前文件的绝对路径
        const filedir = path.join(filePath, filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        fs.stat(filedir, function (eror, stats) {
          if (eror) {
            console.warn("获取文件失败");
          } else {
            const isFile = stats.isFile(); //是文件
            const isDir = stats.isDirectory(); //是文件夹
            if (isFile) {
              if (filedir.includes(".md")) {
                const content = fs.readFileSync(filedir, "utf-8");
                const newHtml = temp
                  .replace("<%- doc %>", marked(content.toString()))
                  .replace(
                    "<head>",
                    `<head><link rel='icon' href='favicon.ico' type='image/x-icon'/>`
                  );
                if (filedir === `${input}${path.sep}README.md`) {
                  fs.writeFileSync(`${output}/index.html`, newHtml);
                } else {
                  fs.writeFileSync(
                    filedir.replace(input, output).replace(".md", ".md.html"),
                    newHtml
                  );
                }
              } else if (filedir.includes(".html")) {
                const content = fs.readFileSync(filedir, "utf-8");
                const newContent = content.replace(
                  "<head>",
                  `<head><link rel='icon' href='favicon.ico' type='image/x-icon'/>`
                );
                fs.writeFileSync(filedir.replace(input, output), newContent);
              } else {
                fs.copyFileSync(filedir, filedir.replace(input, output));
              }
            }
            if (isDir) {
              const out = filedir.replace(input, output);
              fs.mkdirSync(out);
              fs.copyFileSync(faviconPath, path.join(out, "favicon.ico"));
              fileDisplay(filedir); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
            }
          }
        });
      });
    }
  });
}

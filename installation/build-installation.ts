const packager = require("electron-packager");
const os = require("os");
const fs = require("fs");

async function getExtraResource() {
    return new Promise((resolve, reject) => {
        fs.readFile(__dirname + "/extra-resource.json", "utf8", (err: any, data: string) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

function getIgnore() {
    const ignore = [
        "\\.gitignore",
        ".*.pdb",

        "^/\\.vscode",
        "^/\\.prettierrc",
        "^/tslint\\.json",
        "^/npm-debug\\.log",
        "^/gulpfile\\.js",
        "^/package-lock\\.json",
        "^/\\.prettierignore",
        "^/\\.editorconfig",
        "^/notes\\.md",
        "^/watch-less\\.js",
        "^/wipe-dependencies\\.js",

        "^/docs",
        "^/extensions",
        "^/images",
        "^/instruments",
        "^/installation",
        "^/help",
        "^/test",

        "^/src/tsconfig\\.dev\\.json",
        "^/src/tsconfig\\.json",
        "^/src/.*\\.ts",
        "^/src/.*\\.tsx",
        "^/src/.*\\.js\\.map",
        "^/src/.*\\.less",

        "^/node_modules/better-sqlite3/build/Release/obj.*",
        "^/node_modules/lzz-gyp/lzz-compiled/linux",
        "^/node_modules/lzz-gyp/lzz-compiled/osx",
        "^/node_modules/lzz-gyp/lzz-compiled/bsd"
    ];

    return ignore;
}

(async () => {
    try {
        const options = {
            dir: ".",
            platform: os.platform(),
            arch: "x64",
            asar: true,
            prune: true,
            overwrite: true,
            icon: "icon.ico",
            extraResource: await getExtraResource(),
            ignore: getIgnore()
        };

        const appPaths = await packager(options);

        fs.copyFileSync("./LICENSE.TXT", appPaths[0] + "/LICENSE.EEZSTUDIO.TXT");
    } catch (err) {
        console.error(err);
    }

    process.exit();
})();

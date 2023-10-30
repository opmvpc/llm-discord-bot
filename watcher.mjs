import chokidar from "chokidar";
import { spawn } from "child_process";
import fs from "fs";

let processus;

async function lancerScript(cheminScript) {
  if (processus) {
    processus.kill();
  }

  // check si le chemin est défini
  if (!cheminScript) {
    throw new Error(
      "Le chemin du fichier à lancer doit être défini dans les arguments."
    );
  }

  // check si le chemin est un fichier js ou mjs
  if (!cheminScript.endsWith(".js") && !cheminScript.endsWith(".mjs")) {
    throw new Error("Le chemin du fichier à lancer doit être un fichier js.");
  }

  let path = new URL(cheminScript, import.meta.url);
  // replace double "C:\\C:\\" with single "C:\\"
  path = path.pathname.replace(/^\/([a-z]):\//i, "$1:/");
  let fileExist;
  do {
    try {
      fs.accessSync(path, fs.constants.F_OK);
      fileExist = true;
    } catch (error) {
      fileExist = false;
    }
  } while (!fileExist);

  processus = spawn("node", [cheminScript]);

  processus.stdout.on("data", (data) => {
    console.info(`${data}`);
  });

  processus.stderr.on("data", (data) => {
    if (new String(data).startsWith("Received a non-JSON parseable chunk")) {
      return;
    }

    console.error(`stderr: ${data}`);
  });

  processus.on("close", (code) => {
    console.log(`Le processus s'est terminé avec le code ${code}`);
  });
}

// exlude map files
const observateur = chokidar.watch(
  ["./dist", "./src", "./generatePersonas.mjs"],
  {
    ignored: /\.map$/,
  }
);

observateur.on("change", (chemin) => {
  console.log(`Fichier modifié: ${chemin}`);
  lancerScript(cheminScript);
});

// récupérer le chemin du fichier à lancer depuis les arguments
const cheminScript = process.argv[2];

// Lance le script pour la première fois
await lancerScript(cheminScript);

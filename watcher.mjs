import chokidar from "chokidar";
import { spawn } from "child_process";

let processus;

function lancerScript() {
  if (processus) {
    processus.kill();
  }

  processus = spawn("node", ["./dist/index.js"]);

  processus.stdout.on("data", (data) => {
    console.info(`${data}`);
  });

  processus.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  processus.on("close", (code) => {
    console.log(`Le processus s'est terminé avec le code ${code}`);
  });
}

// exlude map files
const observateur = chokidar.watch("./dist", {
  ignored: /\.map$/,
});

observateur.on("change", (chemin) => {
  console.log(`Fichier modifié: ${chemin}`);
  lancerScript();
});

// Lance le script pour la première fois
lancerScript();

import FtpDeploy from 'ftp-deploy';
const ftpDeploy = new FtpDeploy();

const config = {
    user: "dagaveema",
    password: "FLstudio2024!",
    host: "pictosound.com",
    port: 21,
    localRoot: "./out", // Next.js 'export' genera la cartella 'out'
    remoteRoot: "/httpdocs/leo", 
    include: ["*", "**/*"],
    // Keep previous hashed assets during rollout so cached HTML does not break with 404 chunk errors.
    deleteRemote: false,
    forcePasv: true,
    sftp: false
};

console.log("🚀 Iniciando deploy di LEO via FTP...");

ftpDeploy
    .deploy(config)
    .then((res) => console.log("✅ Deploy completato con successo!", res))
    .catch((err) => console.error("❌ Errore durante il deploy:", err));

ftpDeploy.on("uploading", function (data) {
    console.log(`⬆️ Caricamento: ${data.transferredFileCount} / ${data.totalFilesCount} - ${data.filename}`);
});

ftpDeploy.on("uploaded", function (data) {
    console.log(`✔️ Completato: ${data.transferredFileCount} / ${data.totalFilesCount}`);
});

ftpDeploy.on("upload-error", function (data) {
    console.error(`⚠️ Errore caricamento file: ${data.filename}`, data.err);
});

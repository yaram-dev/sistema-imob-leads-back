const fs = require("fs");
const path = require("path");

const origem = path.join(__dirname, "src", "generated", "prisma");
const destino = path.join(__dirname, "dist", "generated", "prisma");

fs.cpSync(origem, destino, { recursive: true });

console.log("Prisma Client copiado para dist/generated/prisma");

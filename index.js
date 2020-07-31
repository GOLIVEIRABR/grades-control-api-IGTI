import express from "express";
import winston from "winston"; //importação do winston para logs
import gradesRouter from "./routes/grades.js"
import {promises as fs} from "fs";

const {readFile, writeFile} = fs;

global.fileName = "grades.json";

//criação do objeto logger do winston
const {combine, timestamp, label, printf} = winston.format; //criando as categorias do formato
const myFormat = printf(({level, message, label, timestamp})=>{ //criando o formato
  return `${timestamp} [${label}] ${level}: ${message}`;
});
global.logger = winston.createLogger({
  level: "silly",
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: "grades-control-api.log"})
  ],
  format: combine(
    label({ label: "grades-control-api"}),
    timestamp(),
    myFormat
  )
});
//fim da criação

const app = express();
app.use(express.json());

app.use("/grades", gradesRouter);

app.listen(3000, async () => {    
  try {
      await readFile(global.fileName);
      logger.info("👏 API Started! 👏");
  } catch (err) {
      logger.error("⛔️ Itsn't possible get up the server! - "+err+ "⛔️");     
  }
});

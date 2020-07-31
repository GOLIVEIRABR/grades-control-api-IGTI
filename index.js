import express from "express";
import gradesRouter from "./routes/grades.js"
import {promises as fs} from "fs";

const {readFile, writeFile} = fs;
global.fileName = "grades.json";

const app = express();
app.use(express.json());

app.use("/grades", gradesRouter);

app.listen(3000, async () => {    
  try {
      await readFile(global.fileName);
      console.log("👏API Started!👏");
  } catch (err) {
      console.log("Itsn't possible get up the server! - "+err.message);     
  }
});

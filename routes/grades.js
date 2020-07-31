import express from "express";
import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));

    let grade = req.body;
    grade = {
      id: data.nextId++,
      student: grade.student,
      subject: grade.subject,
      type: grade.type,
      value: parseInt(grade.value),
      timestamp: new Date(),
    };
    data.grades.push(grade);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    global.logger.info(`ℹ️ ${req.method} ${req.baseUrl} - ${JSON.stringify(grade)} ℹ️`);
    res.send(grade);

  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const data = JSON.parse( await readFile(global.fileName));
    const grade = data.grades.find(current => current.id === parseInt(req.params.id));
    
    global.logger.info(`ℹ️ ${req.method} ${req.baseUrl} - id: ${req.params.id} ℹ️`);
    res.json(grade);

  } catch (err) {
    next(err);
  }
}).next;

router.put("/", async (req, res, next) => {
  try {
    const data = JSON.parse( await readFile(global.fileName));

    const grade = req.body;    
    const index = data.grades.findIndex(current => current.id === parseInt(grade.id))

    if (index === -1){
      throw new Error('Registro não encontrado!');
    }

    data.grades[index].student = grade.student;
    data.grades[index].subject = grade.subject;
    data.grades[index].type = grade.type;
    data.grades[index].value = parseInt(grade.value);

    await writeFile(global.fileName, JSON.stringify(data, null, 2))

    global.logger.info(`ℹ️ ${req.method} ${req.baseUrl} - id: ${grade.id} ℹ️`);
    res.send(grade);

  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    data.grades = data.grades.filter(grade => grade.id !== parseInt(req.params.id));
    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    global.logger.info(`ℹ️ ${req.method} ${req.baseUrl} - id: ${req.params.id} ℹ️`);
    res.end();

  } catch (err) {
    next(err)
  }
});

router.get("/student/:student/subject/:subject", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const student = req.params.student;
    const subject = req.params.subject;

    let grades = data.grades.filter(grade => grade.student === student);
    grades = grades.filter(grade => grade.subject === subject);

    let total = grades.reduce((total, grade) => {
      return total + grade.value;
    }, 0);

    global.logger.info(`ℹ️ ${req.method} ${req.baseUrl} - Total: ${total} ℹ️`);
    res.send(''+total+'');

  } catch (err) {
    next(err)
  }
});

router.get("/average/:subject/type/:type", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const subject = req.params.subject;
    const type = req.params.type;

    let grades = data.grades.filter(grade => grade.subject === subject);
    grades = grades.filter(grade => grade.type === type);

    let average = grades.reduce((total, grade)=>{
      return total + grade.value;
    }, 0);

    average = (average/grades.length);

    global.logger.info(`ℹ️ ${req.method} ${req.baseUrl} - Média: ${average} ℹ️`);
    res.send(''+average+'');
  } catch (err) {
    next(err)
  }
});

router.get("/bests/:subject/type/:type", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const subject = req.params.subject;
    const type = req.params.type;

    let grades = data.grades.filter(grade => grade.subject === subject);
    grades = grades.filter(grade => grade.type === type);
    
    grades.sort((a,b)=>{
      if(a.value < b.value){
        return 1;
      }else if(a.value > b.value){
        return -1;
      }
    });

    grades.splice(3,1)

    global.logger.info(`ℹ️ ${req.method} ${req.baseUrl} - ${JSON.stringify(grades)} ℹ️`);
    res.send(grades);

  } catch (err) {
    next(err)
  }
});

router.use((err, req, res, next)=>{
  global.logger.error(`⛔️ ${req.method} ${req.baseUrl} - ${err.message} ⛔️`);
  res.status(400).send({erro: err.message});
})

export default router;

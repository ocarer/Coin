const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

let AValues = []; // A 값 저장소

// A 값 저장
app.post("/save", (req, res) => {
    const { A } = req.body;
    if (A) {
        AValues.push({ A, timestamp: new Date() });
        res.status(200).send({ message: "저장 성공", data: AValues });
    } else {
        res.status(400).send({ message: "잘못된 데이터" });
    }
});

// A 값 가져오기
app.get("/values", (req, res) => {
    res.status(200).send(AValues);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

const connetcToMongo = require("./db");
const express = require('express')
var cors = require('cors')


connetcToMongo();

const app = express();
const port = process.env.PORT || 5000

//available routes
app.use(express.json())
app.use(cors())
app.use("/api/auth", require("./routes/auth"))
app.use("/api/notes", require("./routes/notes"))
app.get("/",(req, resp)=>{
  resp.send("hello Parth");
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
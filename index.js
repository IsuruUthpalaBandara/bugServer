const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");

const mysql=require('mysql');

app.use(cors());
//var jsonParser=bodyParser.json()
//var urlencodedParser=bodyParser.urlencoded({extended:false})
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));



const jwt = require('jsonwebtoken')
const dotenv=require('dotenv');
dotenv.config();
process.env.TOKEN_SECRET

function genToken(email){
    return jwt.sign(email,process.env.TOKEN_SECRET,{expiresIn:'60s'})
}




const database=mysql.createPool({
    host:'localhost',
    user:'root',
    password:'password',
    database:'bugtracker',
});



app.post("/api/signin",(req,res)=>{
    const userName=req.body.userName
    const userPassword=req.body.userPassword
    const userEmail=req.body.userEmail

    console.log(userName,userPassword,userEmail)

    const sqlInsert="INSERT INTO userdata(userName,userPassword,userEmail) VALUES(?,?,?) ;"
    database.query(sqlInsert,[userName,userPassword,userEmail],(err,result)=>{
       if(err)throw((err)=>{
            console.log("err sign in=>",err)
       })
       const msg="signin success"
       res.json(msg)
    });
});

app.post("/api/login",(req,res)=>{
    const userEmail=req.body.userEmail;
    const userPassword=req.body.userPassword;

    console.log("->",userEmail)
    

    const sqlCheck="(SELECT * FROM userdata WHERE userEmail=? AND userPassword=?)"
    database.query(sqlCheck,[userEmail,userPassword],(err,result)=>{
        if(result==0){
            res.status(403).send(err)
            console.log(err)
        }
        else{
            const token=genToken({email:req.body.userEmail})
            res.json(token)
            console.log('recieved login : ',userEmail,userPassword)
        }
    })

})

app.post("/api/createproject",(req,res)=>{

    const projectName=req.body.projectName;
    const projectCreator=req.body.projectCreator;
    const projectPassword=req.body.projectPassword;


    console.log(projectName)
    console.log(projectCreator)
    console.log(projectPassword)

    sqlCreateProject="INSERT INTO projects(projectName,projectCreator,projectPassword) VALUES(?,?,?);"

    database.query(sqlCreateProject,[projectName,projectCreator,projectPassword],(err,result)=>{
        
        if(err)throw(console.log("Error in creating project=>",err))
        res.send(result)
        console.log("created project=>",projectName)
        
    })

})


app.post("/api/loadproject",(req,res)=>{
    const loadProject=req.body.projectName
    

   console.log(loadProject)
  


    sqlLoadProject="SELECT * FROM projects WHERE projectName=?"
    database.query(sqlLoadProject,[loadProject],(err,result)=>{

        if(result==0){
            res.status(403).send(err)
            console.log("Error Loading Project=>",err)

        }
        else{

            console.log("Loaded Project JSON=>",JSON.stringify(result))
            res.send(result)

        }
        
    })
})


app.post("/api/updateproject",(req,res)=>{

    const updateProject=req.body.updateProject
    const updateBugReport=JSON.stringify(updateProject.bugReport)
    const matchProjectName=updateProject.projectName
    const matchProjectID=updateProject.ID

    console.log("update this=>",updateProject)
    console.log("update bugReport=>",updateBugReport)
    sqlUpdate="UPDATE projects SET bugReport=? WHERE projectName=? AND ID=?"
    database.query(sqlUpdate,[updateBugReport,matchProjectName,matchProjectID],(err,result)=>{
        if(err)throw(console.log("Update err=>",err))
        res.send(result)
    })
    
})


app.get('/api/projectlist',(req,res)=>{
    const sqlProjectList = "SELECT projectName, projectCreator FROM projects"
    database.query(sqlProjectList,(err,result)=>{
        if(err)throw(console.log("Error Project List=>",err))
        res.send(result)
        console.log("Project List=>",result)
    })
})




const port = 3001
app.listen(port,()=>{
    console.log('bugServer listening on port ',port)
})

const express=require("express");
const multer=require("multer");
const cookieParser=require("cookie-parser");
const fs=require("fs");
const path=require("path");
const crypto=require("crypto");

const app=express();
const PORT=process.env.PORT||3000;
const ROOT=__dirname, PUBLIC=path.join(ROOT,"public"), DATA=path.join(ROOT,"data.json");
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||"admin12345";
const SESSION_SECRET=process.env.SESSION_SECRET||"replace-me-in-production";
const sessions=new Map();

app.use(express.json({limit:"2mb"}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(PUBLIC,{extensions:["html"]}));

function readData(){return JSON.parse(fs.readFileSync(DATA,"utf8"))}
function writeData(d){fs.writeFileSync(DATA,JSON.stringify(d,null,2))}
function auth(req,res,next){
  const sid=req.cookies.tw_session;
  if(!sid||!sessions.has(sid)) return res.status(401).json({error:"Unauthorized"});
  next();
}
function safeFileName(original){
  const ext=path.extname(original).toLowerCase();
  const allowed=[".jpg",".jpeg",".png",".webp",".gif",".svg"];
  if(!allowed.includes(ext)) throw new Error("Unsupported image type");
  return Date.now()+"-"+crypto.randomBytes(5).toString("hex")+ext;
}
const upload=multer({
  storage:multer.diskStorage({
    destination:(req,file,cb)=>cb(null,path.join(PUBLIC,"uploads")),
    filename:(req,file,cb)=>{try{cb(null,safeFileName(file.originalname))}catch(e){cb(e)}}
  }),
  limits:{fileSize:5*1024*1024}
});

app.get("/api/content",(req,res)=>res.json(readData()));
app.post("/api/login",(req,res)=>{
  const {password}=req.body||{};
  if(password!==ADMIN_PASSWORD) return res.status(401).json({error:"Invalid password"});
  const sid=crypto.randomBytes(32).toString("hex");
  sessions.set(sid,Date.now());
  res.cookie("tw_session",sid,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:8*60*60*1000});
  res.json({ok:true});
});
app.post("/api/logout",auth,(req,res)=>{sessions.delete(req.cookies.tw_session);res.clearCookie("tw_session");res.json({ok:true})});
app.get("/api/me",(req,res)=>res.json({authenticated:!!(req.cookies.tw_session&&sessions.has(req.cookies.tw_session))}));

app.post("/api/content",auth,(req,res)=>{
  try{writeData(req.body);res.json({ok:true,data:req.body})}catch(e){res.status(400).json({error:"Could not save"})}
});
app.post("/api/upload",auth,upload.single("image"),(req,res)=>{
  if(!req.file)return res.status(400).json({error:"No image"});
  res.json({url:"uploads/"+req.file.filename});
});
app.get("/admin",(req,res)=>res.sendFile(path.join(PUBLIC,"admin.html")));
app.use((err,req,res,next)=>{if(err instanceof multer.MulterError||err) return res.status(400).json({error:err.message});next(err)});
app.listen(PORT,()=>console.log(`Trend Wear BD running on ${PORT}`));
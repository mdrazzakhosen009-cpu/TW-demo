let data=null,current="site";
const $=id=>document.getElementById(id);
async function api(url,opt={}){const r=await fetch(url,opt);if(!r.ok)throw new Error((await r.json()).error||"Request failed");return r.json()}
async function boot(){try{const m=await api("/api/me");if(m.authenticated){show();await load()}}catch(e){}}
function login(){api("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:$("pw").value})}).then(()=>{show();load()}).catch(e=>$("err").textContent=e.message)}
function show(){$("login").classList.add("hidden");$("panel").classList.remove("hidden")}
async function logout(){await api("/api/logout",{method:"POST"});location.reload()}
async function load(){data=await api("/api/content");draw()}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");current=b.dataset.tab;draw()});
function input(label,path,value,area=false){
      const isImg=/image/i.test(label);
      if(isImg)return `<div class="field"><label>${label}</label><input data-path="${path}" value="${esc(value)}"><input type="file" accept="image/*" data-upload-path="${path}" onchange="uploadImage(this,'${path}')"></div>`;
      return `<div class="field"><label>${label}</label>${area?`<textarea data-path="${path}">${esc(value)}</textarea>`:`<input data-path="${path}" value="${esc(value)}">`}</div>`
    }
    async function uploadImage(el,path){
      if(!el.files[0])return;
      const fd=new FormData();fd.append("image",el.files[0]);
      try{const r=await fetch("/api/upload",{method:"POST",body:fd});const j=await r.json();if(!r.ok)throw new Error(j.error||"Upload failed");setPath(data,path,j.url);draw();}catch(e){alert(e.message)}
    }
function esc(x){return String(x??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function getPath(obj,path){return path.split(".").reduce((a,k)=>a?.[k],obj)}
function setPath(obj,path,val){const a=path.split(".");let o=obj;for(let i=0;i<a.length-1;i++)o=o[a[i]];o[a.at(-1)]=val}
function bind(){document.querySelectorAll("[data-path]").forEach(el=>el.oninput=()=>setPath(data,el.dataset.path,el.value))}
function draw(){
 const e=$("editor");
 if(current==="site"){e.innerHTML=`<div class="card"><h2>Brand & SEO</h2>${input("Website name","site.name",data.site.name)}${input("Tagline","site.tagline",data.site.tagline)}<div class="row">${input("Logo top","site.logoTop",data.site.logoTop)}${input("Logo bottom","site.logoBottom",data.site.logoBottom)}</div>${input("WhatsApp number","site.whatsapp",data.site.whatsapp)}${input("SEO title","site.seoTitle",data.site.seoTitle)}${input("SEO description","site.seoDescription",data.site.seoDescription,true)}</div>${savebar()}`;bind()}
 if(current==="footer"){e.innerHTML=`<div class="card"><h2>Footer</h2>${input("About","footer.about",data.footer.about,true)}<div class="row">${input("Address","footer.address",data.footer.address)}${input("Email","footer.email",data.footer.email)}</div><h3>Social links</h3>${Object.keys(data.footer.social).map(k=>input(k,"footer.social."+k,data.footer.social[k])).join("")}</div>${savebar()}`;bind()}
 if(current==="sections"){drawSections(e)}
 if(current==="preview"){e.innerHTML=`<div class="card"><h2>Live preview</h2><p>Open the preview below. Save changes first to update the public page.</p><iframe class="preview" src="/"></iframe></div>`}
}
function savebar(){return `<div class="savebar"><span class="status">Changes are local until you publish.</span><button class="save" onclick="save()">Save & Publish</button></div>`}
function drawSections(e){
 let html=`<div class="card"><h2>Landing page sections</h2><p style="color:#6c7890">Toggle visibility and edit content. Use ↑ / ↓ to reorder sections.</p>`;
 data.sections.sort((a,b)=>a.order-b.order).forEach((s,i)=>{html+=`<div class="item"><div class="item-head"><b>${s.type.toUpperCase()}</b><div><button class="add" onclick="move(${i},-1)">↑</button> <button class="add" onclick="move(${i},1)">↓</button> <button class="danger" onclick="toggle('${s.id}')">${s.enabled?"Hide":"Show"}</button></div></div>${sectionFields(s,i)}</div>`});
 html+=`</div>${savebar()}`;e.innerHTML=html;bind();
}
function sectionFields(s,i){
 let h=input("Section title",`sections.${i}.title`,s.title||"");
 if(s.type==="hero")return input("Eyebrow",`sections.${i}.eyebrow`,s.eyebrow)+input("Headline",`sections.${i}.title`,s.title)+input("Subtitle",`sections.${i}.subtitle`,s.subtitle,true)+`<div class="row">${input("Button text",`sections.${i}.buttonText`,s.buttonText)}${input("Button link",`sections.${i}.buttonLink`,s.buttonLink)}</div>`+input("Image URL / uploaded path",`sections.${i}.image`,s.image);
 if(s.type==="categories")return h+input("Subtitle",`sections.${i}.subtitle`,s.subtitle)+listItems(s.items,`sections.${i}.items`,["name","label","image"]);
 if(s.type==="products")return h+input("Subtitle",`sections.${i}.subtitle`,s.subtitle)+listItems(s.items,`sections.${i}.items`,["name","price","oldPrice","badge","image"]);
 if(s.type==="promo")return h+input("Text",`sections.${i}.text`,s.text,true)+`<div class="row">${input("Button",`sections.${i}.buttonText`,s.buttonText)}${input("Link",`sections.${i}.buttonLink`,s.buttonLink)}</div>`+input("Image",`sections.${i}.image`,s.image);
 if(s.type==="about")return h+input("Text",`sections.${i}.text`,s.text,true)+input("Image",`sections.${i}.image`,s.image);
 if(s.type==="benefits"||s.type==="testimonials")return h+listItems(s.items,`sections.${i}.items`,s.type==="benefits"?["title","text"]:["name","role","text"]);
 if(s.type==="faq")return h+listItems(s.items,`sections.${i}.items`,["q","a"]);
 if(s.type==="cta")return h+input("Text",`sections.${i}.text`,s.text,true)+`<div class="row">${input("Button",`sections.${i}.buttonText`,s.buttonText)}${input("Link",`sections.${i}.buttonLink`,s.buttonLink)}</div>`;
 return "";
}
function listItems(items,path,keys){return items.map((it,j)=>`<div class="item"><div class="item-head"><b>Item ${j+1}</b><button class="danger" onclick="removeItem('${path}',${j})">Delete</button></div>${keys.map(k=>input(k,`${path}.${j}.${k}`,it[k]||"")).join("")}</div>`).join("")+`<button class="add" onclick='addItem(${JSON.stringify(path)},${JSON.stringify(keys)})'>+ Add item</button>`}
function toggle(id){const s=data.sections.find(x=>x.id===id);s.enabled=!s.enabled;draw()}
function move(i,dir){const a=data.sections;const j=i+dir;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];a.forEach((x,k)=>x.order=k+1);draw()}
function removeItem(path,i){const a=getPath(data,path);a.splice(i,1);draw()}
function addItem(path,keys){const a=getPath(data,path),o={};keys.forEach(k=>o[k]="");a.push(o);draw()}
async function save(){document.querySelectorAll("[data-path]").forEach(el=>setPath(data,el.dataset.path,el.value));try{await api("/api/content",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});alert("Saved and published successfully.");}catch(e){alert(e.message)}}
$("pw").addEventListener("keydown",e=>{if(e.key==="Enter")login()});boot();
const output=document.getElementById("output");
const input=document.getElementById("terminal-input");

function print(t){ output.innerHTML+=t+"\n"; output.scrollTop=output.scrollHeight; }

async function loadPage(name){
  try{
    const res=await fetch(`pages/${name}.txt`);
    if(!res.ok){ print("Page not found."); return; }
    const text=await res.text();
    print("\n"+text+"\n");
  }catch(e){ print("Error loading page."); }
}

function run(cmd){
  const parts=cmd.split(" ");
  const base=parts[0];
  const arg=parts[1];

  if(base==="help"){
    print("Commands: help, clear, open <page>, search <word>");
  }

  else if(base==="clear"){
    output.innerHTML="";
  }

  else if(base==="open"){
    if(!arg){ print("Usage: open <page>"); return; }
    print(`Opening ${arg}...`);
    loadPage(arg);
  }

  else if(base==="search"){
    if(!arg){ print("Usage: search <query>"); return; }
    print(`Searching for '${arg}'...`);
    searchLocal(arg);
  }

  else{
    print("Unknown command.");
  }
}

const searchIndex=[
  {id:"about", text:"About page content"},
  {id:"games", text:"Games list"},
  {id:"contact", text:"Contact info"}
];

function searchLocal(q){
  const r=searchIndex.filter(i=>i.id.includes(q)||i.text.includes(q));
  if(r.length===0){ print("No results found."); return; }
  r.forEach(i=>print(`- ${i.id}`));
}

input.addEventListener("keydown",e=>{
  if(e.key==="Enter"){
    const v=input.value.trim();
    print("> "+v);
    run(v);
    input.value="";
  }
});

const output=document.getElementById("output");
const input=document.getElementById("terminal-input");

let loggedIn=false;
const allowedUsers=["admin","player1","player2"]; // <-- EDIT THIS LIST

function print(t){ output.innerHTML+=t+"\n"; output.scrollTop=output.scrollHeight; }

function loginSystem(cmd){
  if(!allowedUsers.includes(cmd)){
    print("ACCESS DENIED");
    return;
  }
  loggedIn=true;
  print("ACCESS GRANTED\nWelcome, "+cmd+"\nType 'help' to begin.");
}

async function loadPage(name){
  try{
    const res=await fetch(`pages/${name}.txt`);
    if(!res.ok){ print("Page not found."); return; }
    const text=await res.text();
    print("\n"+text+"\n");
  }catch(e){ print("Error loading page."); }
}

function showGames(){
  print("\nGAME LAUNCHER");
  print("-------------");
  games.forEach(g=>{
    print(`- ${g.id}: ${g.title}  (type: play ${g.id})`);
  });
  print("");
}

const games=[
  {id:"voidrunner", title:"Void Runner", url:"/games/voidrunner/index.html"},
  {id:"cryptshift", title:"Crypt Shift", url:"/games/cryptshift/index.html"}
];

function run(cmd){
  const parts=cmd.split(" ");
  const base=parts[0];
  const arg=parts[1];

  if(!loggedIn){
    loginSystem(cmd);
    return;
  }

  if(base==="help"){
    print("Commands: help, clear, open <page>, search <word>, games, play <id>");
  }

  else if(base==="clear"){
    output.innerHTML="";
  }

  else if(base==="open"){
    if(!arg){ print("Usage: open <page>"); return; }
    print(`Opening ${arg}...`);
    loadPage(arg);
  }

  else if(base==="games"){
    showGames();
  }

  else if(base==="play"){
    const g=games.find(x=>x.id===arg);
    if(!g){ print("Game not found."); return; }
    print("Launching "+g.title+"...");
    window.open(g.url,"_blank");
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

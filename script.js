const output = document.getElementById("output");
const input = document.getElementById("terminal-input");

let loggedIn = false;
let currentUser = null;

const allowedUsers = ["player1","player2","guest"];
const adminUsers   = ["admin","owner"]; // EDIT ADMIN USERS HERE

const games = [
  {id:"voidrunner", title:"Void Runner", url:"/games/voidrunner/index.html"},
  {id:"cryptshift", title:"Crypt Shift", url:"/games/cryptshift/index.html"}
];

const searchIndex = [
  {id:"about",   text:"About page content"},
  {id:"games",   text:"Games list"},
  {id:"contact", text:"Contact info"}
];

function print(text){
  output.innerHTML += text + "\n";
  output.scrollTop = output.scrollHeight;
}

function loginSystem(username){
  if(adminUsers.includes(username)){
    loggedIn = true;
    currentUser = username;
    print("ADMIN ACCESS GRANTED");
    print("Welcome, " + username);
    print("Type 'adminhelp' for help.");
    return;
  }

  if(allowedUsers.includes(username)){
    loggedIn = true;
    currentUser = username;
    print("ACCESS GRANTED");
    print("Welcome, " + username);
    print("Type 'help' to begin.");
    return;
  }

  print("ACCESS DENIED");
}

async function loadPage(name){
  try{
    const res = await fetch(`pages/${name}.txt`);
    if(!res.ok){
      print("Page not found.");
      return;
    }
    const text = await res.text();
    print("\n" + text + "\n");
  }catch(e){
    print("Error loading page.");
  }
}

function showGames(){
  print("\nGAME LAUNCHER");
  print("-------------");
  games.forEach(g=>{
    print(`- ${g.id}: ${g.title}  (type: play ${g.id})`);
  });
  print("");
}

function searchLocal(query){
  const q = query.toLowerCase();
  const results = searchIndex.filter(i =>
    i.id.toLowerCase().includes(q) ||
    i.text.toLowerCase().includes(q)
  );

  if(results.length === 0){
    print("No results found.");
    return;
  }

  results.forEach(i=>print(`- ${i.id}`));
}

function showAdminConfig(){
  print("\nADMIN CONFIG MENU");
  print("-----------------");
  print("Current user: " + currentUser);
  print("Admin users: " + adminUsers.join(", "));
  print("Normal users: " + allowedUsers.join(", "));
  print("Games:");
  games.forEach(g=>{
    print(` - ${g.id}: ${g.title} (${g.url})`);
  });
  print("\nAdmin commands:");
  print(" - adminhelp");
  print(" - addgame <id> <title> <url>");
  print(" - listgames");
  print(" - listusers");
  print("");
}

function run(command){
  const parts = command.split(" ");
  const base  = parts[0];
  const arg   = parts[1];

  if(!loggedIn){
    loginSystem(command);
    return;
  }

  // ADMIN-ONLY COMMANDS
  if(adminUsers.includes(currentUser)){
    if(base === "adminhelp"){
      print("Admin Commands:");
      print(" - adminconfig");
      print(" - addgame <id> <title> <url>");
      print(" - listgames");
      print(" - listusers");
      return;
    }

    if(base === "adminconfig"){
      showAdminConfig();
      return;
    }

    if(base === "addgame"){
      const id    = parts[1];
      const title = parts[2];
      const url   = parts[3];

      if(!id || !title || !url){
        print("Usage: addgame <id> <title> <url>");
        return;
      }

      games.push({id, title, url});
      print(`Game added: ${title} (${id})`);
      return;
    }

    if(base === "listgames"){
      print("Games:");
      games.forEach(g=>{
        print(` - ${g.id}: ${g.title} (${g.url})`);
      });
      return;
    }

    if(base === "listusers"){
      print("Admin users: " + adminUsers.join(", "));
      print("Normal users: " + allowedUsers.join(", "));
      return;
    }
  }

  // NORMAL COMMANDS
  if(base === "help"){
    print("Commands:");
    print(" - help");
    print(" - clear");
    print(" - open <page>");
    print(" - search <word>");
    print(" - games");
    print(" - play <id>");
    if(adminUsers.includes(currentUser)){
      print("Admin: type 'adminhelp' for more.");
    }
  }

  else if(base === "clear"){
    output.innerHTML = "";
  }

  else if(base === "open"){
    if(!arg){
      print("Usage: open <page>");
      return;
    }
    print(`Opening ${arg}...`);
    loadPage(arg);
  }

  else if(base === "games"){
    showGames();
  }

  else if(base === "play"){
    const g = games.find(x=>x.id === arg);
    if(!g){
      print("Game not found.");
      return;
    }
    print("Launching " + g.title + "...");
    window.open(g.url, "_blank");
  }

  else if(base === "search"){
    if(!arg){
      print("Usage: search <query>");
      return;
    }
    print(`Searching for '${arg}'...`);
    searchLocal(arg);
  }

  else{
    print("Unknown command.");
  }
}

input.addEventListener("keydown", e=>{
  if(e.key === "Enter"){
    const v = input.value.trim();
    print("> " + v);
    run(v);
    input.value = "";
  }
});

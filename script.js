const output = document.getElementById("output");
const input = document.getElementById("terminal-input");
const gameFrame = document.getElementById("game-frame");
const gameIframe = document.getElementById("game-iframe");

let loggedIn = false;
let currentUser = null;

let allowedUsers = ["player1","player2","guest"];
let adminUsers   = ["admin","owner"]; // MAKE SURE YOUR ADMIN USERNAME IS HERE

let games = [
  {id:"voidrunner", title:"Void Runner", url:"/games/voidrunner/index.html"},
  {id:"cryptshift", title:"Crypt Shift", url:"/games/cryptshift/index.html"}
];

function print(text){
  output.innerHTML += text + "\n";
  output.scrollTop = output.scrollHeight;
}

function loginSystem(username){
 if (base === "listusers") {
  print("Admin users:");
  adminUsers.forEach(u => print(" - " + u));

  print("\nNormal users:");
  allowedUsers.forEach(u => print(" - " + u));

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

function playGame(id){
  const g = games.find(x=>x.id === id);
  if(!g){
    print("Game not found.");
    return;
  }

  print("Launching " + g.title + "...");
  gameIframe.src = g.url;
  gameFrame.style.display = "block";
}

function closeGame(){
  gameIframe.src = "";
  gameFrame.style.display = "none";
  print("Game closed.");
}

function showAdminConfig(){
  print("\nADMIN CONFIG MENU");
  print("-----------------");
  print("Current user: " + currentUser);
  print("Admin users: " + adminUsers.join(", "));
  print("Normal users: " + allowedUsers.join(", "));
  print("\nGames:");
  games.forEach(g=>{
    print(` - ${g.id}: ${g.title} (${g.url})`);
  });
  print("\nAdmin commands:");
  print(" - adminhelp");
  print(" - adduser <name>");
  print(" - deluser <name>");
  print(" - addgame <id> <title> <url>");
  print(" - delgame <id>");
  print(" - closegame");
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

  // ============================
  // ADMIN COMMANDS (ALWAYS FIRST)
  // ============================
  if(adminUsers.includes(currentUser)){

    if(base === "adminhelp"){
      print("Admin Commands:");
      print(" - adminconfig");
      print(" - adduser <name>");
      print(" - deluser <name>");
      print(" - addgame <id> <title> <url>");
      print(" - delgame <id>");
      print(" - closegame");
      return;
    }

    if(base === "adminconfig"){
      showAdminConfig();
      return;
    }

    if(base === "adduser"){
      if(!arg){ print("Usage: adduser <name>"); return; }
      if(allowedUsers.includes(arg)){
        print("User already exists.");
        return;
      }
      allowedUsers.push(arg);
      print("User added: " + arg);
      return;
    }

    if(base === "deluser"){
      if(!arg){ print("Usage: deluser <name>"); return; }
      if(!allowedUsers.includes(arg)){
        print("User not found.");
        return;
      }
      allowedUsers = allowedUsers.filter(u => u !== arg);
      print("User removed: " + arg);
      return;
    }

    if(base === "addgame"){
      const id = parts[1];
      const title = parts[2];
      const url = parts[3];

      if(!id || !title || !url){
        print("Usage: addgame <id> <title> <url>");
        return;
      }

      games.push({id, title, url});
      print(`Game added: ${title} (${id})`);
      return;
    }

    if(base === "delgame"){
      if(!arg){ print("Usage: delgame <id>"); return; }
      games = games.filter(g => g.id !== arg);
      print("Game removed: " + arg);
      return;
    }

    if(base === "closegame"){
      closeGame();
      return;
    }
  }

  // ============================
  // NORMAL COMMANDS
  // ============================

  if(base === "help"){
    print("Commands:");
    print(" - help");
    print(" - clear");
    print(" - open <page>");
    print(" - games");
    print(" - play <id>");
    print(" - closegame");
    if(adminUsers.includes(currentUser)){
      print("Admin: type 'adminhelp' for more.");
    }
    return;
  }

  if(base === "clear"){
    output.innerHTML = "";
    return;
  }

  if(base === "open"){
    if(!arg){
      print("Usage: open <page>");
      return;
    }
    print(`Opening ${arg}...`);
    loadPage(arg);
    return;
  }

  if(base === "games"){
    showGames();
    return;
  }

  if(base === "play"){
    playGame(arg);
    return;
  }

  if(base === "closegame"){
    closeGame();
    return;
  }

  print("Unknown command.");
}

input.addEventListener("keydown", e=>{
  if(e.key === "Enter"){
    const v = input.value.trim();
    print("> " + v);
    run(v);
    input.value = "";
  }
});

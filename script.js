const output = document.getElementById("output");
const input = document.getElementById("terminal-input");
const gameFrame = document.getElementById("game-frame");
const gameIframe = document.getElementById("game-iframe");

let loggedIn = false;
let currentUser = null;

// USER DATABASE
let allowedUsers = ["player1", "player2", "guest"];
let adminUsers = ["admin", "owner"];

// GAME DATABASE
let games = [
  { id: "voidrunner", title: "Void Runner", url: "/games/voidrunner/index.html" },
  { id: "cryptshift", title: "Crypt Shift", url: "/games/cryptshift/index.html" }
];

// ===============================
// VIRTUAL FILE SYSTEM
// ===============================
let fs = {
  "/": {
    type: "dir",
    children: {
      "home": { type: "dir", children: {} },
      "games": { type: "dir", children: {} },
      "readme.txt": { type: "file", content: "Welcome to the terminal OS." }
    }
  }
};

let currentPath = "/";

function print(text) {
  output.innerHTML += text + "\n";
  output.scrollTop = output.scrollHeight;
}

function resolvePath(path) {
  if (path.startsWith("/")) return path;
  if (path === "..") {
    let parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    return "/" + parts.join("/");
  }
  if (currentPath === "/") return "/" + path;
  return currentPath + "/" + path;
}

function getNode(path) {
  let parts = path.split("/").filter(Boolean);
  let node = fs["/"];
  for (let p of parts) {
    if (!node.children[p]) return null;
    node = node.children[p];
  }
  return node;
}

// LOGIN SYSTEM
function loginSystem(username) {
  if (adminUsers.includes(username)) {
    loggedIn = true;
    currentUser = username;
    print("ADMIN ACCESS GRANTED");
    print("Welcome, " + username);
    print("Type 'adminhelp' for help.");
    return;
  }

  if (allowedUsers.includes(username)) {
    loggedIn = true;
    currentUser = username;
    print("ACCESS GRANTED");
    print("Welcome, " + username);
    print("Type 'help' to begin.");
    return;
  }

  print("ACCESS DENIED");
}

// LOAD PAGE CONTENT
async function loadPage(name) {
  try {
    const res = await fetch(`pages/${name}.txt`);
    if (!res.ok) {
      print("Page not found.");
      return;
    }
    const text = await res.text();
    print("\n" + text + "\n");
  } catch (e) {
    print("Error loading page.");
  }
}

// GAME FUNCTIONS
function showGames() {
  print("\nGAME LAUNCHER");
  print("-------------");
  games.forEach(g => {
    print(`- ${g.id}: ${g.title} (type: play ${g.id})`);
  });
  print("");
}

function playGame(id) {
  const g = games.find(x => x.id === id);
  if (!g) {
    print("Game not found.");
    return;
  }

  print("Launching " + g.title + "...");
  gameIframe.src = g.url;
  gameFrame.style.display = "block";
}

function closeGame() {
  gameIframe.src = "";
  gameFrame.style.display = "none";
  print("Game closed.");
}

// ADMIN CONFIG MENU
function showAdminConfig() {
  print("\nADMIN CONFIG MENU");
  print("-----------------");
  print("Current user: " + currentUser);
  print("Admin users:");
  adminUsers.forEach(u => print(" - " + u));
  print("\nNormal users:");
  allowedUsers.forEach(u => print(" - " + u));
  print("\nGames:");
  games.forEach(g => print(` - ${g.id}: ${g.title} (${g.url})`));
  print("\nAdmin commands:");
  print(" - adminhelp");
  print(" - adminconfig");
  print(" - listusers");
  print(" - adduser <name>");
  print(" - deluser <name>");
  print(" - listgames");
  print(" - addgame <id> <title> <url>");
  print(" - delgame <id>");
  print(" - closegame");
  print(" - mkdir <name>");
  print(" - mkfile <name>");
  print(" - rm <name>");
  print("");
}

// MAIN COMMAND ROUTER
function run(command) {
  const parts = command.split(" ");
  const base = parts[0];
  const arg = parts[1];

  // LOGIN FIRST
  if (!loggedIn) {
    loginSystem(command);
    return;
  }

  // ============================
  // ADMIN COMMANDS
  // ============================
  if (adminUsers.includes(currentUser)) {

    if (base === "adminhelp") {
      print("Admin Commands:");
      print(" - adminconfig");
      print(" - listusers");
      print(" - adduser <name>");
      print(" - deluser <name>");
      print(" - listgames");
      print(" - addgame <id> <title> <url>");
      print(" - delgame <id>");
      print(" - mkdir <name>");
      print(" - mkfile <name>");
      print(" - rm <name>");
      print(" - closegame");
      return;
    }

    if (base === "adminconfig") {
      showAdminConfig();
      return;
    }

    if (base === "listusers") {
      print("Admin users:");
      adminUsers.forEach(u => print(" - " + u));
      print("\nNormal users:");
      allowedUsers.forEach(u => print(" - " + u));
      return;
    }

    if (base === "adduser") {
      if (!arg) { print("Usage: adduser <name>"); return; }
      if (allowedUsers.includes(arg)) {
        print("User already exists.");
        return;
      }
      allowedUsers.push(arg);
      print("User added: " + arg);
      return;
    }

    if (base === "deluser") {
      if (!arg) { print("Usage: deluser <name>"); return; }
      if (!allowedUsers.includes(arg)) {
        print("User not found.");
        return;
      }
      allowedUsers = allowedUsers.filter(u => u !== arg);
      print("User removed: " + arg);
      return;
    }

    if (base === "listgames") {
      print("Games:");
      games.forEach(g => print(` - ${g.id}: ${g.title} (${g.url})`));
      return;
    }

    if (base === "addgame") {
      const id = parts[1];
      const title = parts[2];
      const url = parts[3];

      if (!id || !title || !url) {
        print("Usage: addgame <id> <title> <url>");
        return;
      }

      games.push({ id, title, url });
      print(`Game added: ${title} (${id})`);
      return;
    }

    if (base === "delgame") {
      if (!arg) { print("Usage: delgame <id>"); return; }
      games = games.filter(g => g.id !== arg);
      print("Game removed: " + arg);
      return;
    }

    if (base === "mkdir") {
      if (!arg) { print("Usage: mkdir <name>"); return; }
      let path = resolvePath(arg);
      let parent = getNode(currentPath);
      parent.children[arg] = { type: "dir", children: {} };
      print("Directory created: " + arg);
      return;
    }

    if (base === "mkfile") {
      if (!arg) { print("Usage: mkfile <name>"); return; }
      let parent = getNode(currentPath);
      parent.children[arg] = { type: "file", content: "" };
      print("File created: " + arg);
      return;
    }

    if (base === "rm") {
      if (!arg) { print("Usage: rm <name>"); return; }
      let parent = getNode(currentPath);
      delete parent.children[arg];
      print("Removed: " + arg);
      return;
    }

    if (base === "closegame") {
      closeGame();
      return;
    }
  }

  // ============================
  // FILE SYSTEM COMMANDS
  // ============================

  if (base === "ls") {
    let node = getNode(currentPath);
    Object.keys(node.children).forEach(k => print(k));
    return;
  }

  if (base === "pwd") {
    print(currentPath);
    return;
  }

  if (base === "cd") {
    if (!arg) { print("Usage: cd <folder>"); return; }
    let newPath = resolvePath(arg);
    let node = getNode(newPath);
    if (!node || node.type !== "dir") {
      print("Directory not found.");
      return;
    }
    currentPath = newPath;
    print("Moved to " + currentPath);
    return;
  }

  if (base === "cat") {
    if (!arg) { print("Usage: cat <file>"); return; }
    let filePath = resolvePath(arg);
    let node = getNode(filePath);
    if (!node || node.type !== "file") {
      print("File not found.");
      return;
    }
    print(node.content || "(empty file)");
    return;
  }

  // ============================
  // NORMAL COMMANDS
  // ============================

  if (base === "help") {
    print("Commands:");
    print(" - help");
    print(" - clear");
    print(" - open <page>");
    print(" - games");
    print(" - play <id>");
    print(" - closegame");
    print(" - ls");
    print(" - cd <folder>");
    print(" - pwd");
    print(" - cat <file>");
    if (adminUsers.includes(currentUser)) {
      print("Admin: type 'adminhelp' for more.");
    }
    return;
  }

  if (base === "clear") {
    output.innerHTML = "";
    return;
  }

  if (base === "open") {
    if (!arg) {
      print("Usage: open <page>");
      return;
    }
    print(`Opening ${arg}...`);
    loadPage(arg);
    return;
  }

  if (base === "games") {
    showGames();
    return;
  }

  if (base === "play") {
    playGame(arg);
    return;
  }

  if (base === "closegame") {
    closeGame();
    return;
  }

  print("Unknown command.");
}

// INPUT HANDLER
input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const v = input.value.trim();
    print("> " + v);
    run(v);
    input.value = "";
  }
});

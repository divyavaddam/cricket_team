const express = require("express");
const app = express();
module.exports = app;
app.use(express.json());
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
let db = null;
const dbPath = path.join(__dirname, "cricketTeam.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//GET PLAYERS API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
      * 
    FROM 
      cricket_team 
    ORDER BY 
      player_id;
    `;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((item) => convertDbObjectToResponseObject(item))
  );
});

//POST PLAYER API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
  INSERT INTO 
    cricket_team(player_name,jersey_number,role)
  VALUES('${playerName}',${jerseyNumber},'${role}');
  `;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});
//GET PLAYER API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
      *
    FROM 
      cricket_team 
    WHERE 
      player_id=${playerId};

    `;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});
//UPDATE PLAYER API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
      UPDATE 
        cricket_team 
      SET
        player_name='${playerName}',
        jersey_number=${jerseyNumber},
        role='${role}'
      WHERE 
        player_id=${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});
//DELETE PLAYER API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE FROM 
      cricket_team 
    WHERE player_id=${playerId};
  `;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

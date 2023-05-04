const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const cors = require('cors');
const multer = require('multer');
const uuid = require('uuid');

PORT=8080;

// connect to db
let db;
(async () => {
	db = await open({
		filename: 'database.db',
		driver: sqlite3.Database
	});
})();

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, './guestbook/public/images'); //the destination folder
	},
	filename: function (req, file, cb) {
	  const uniqueId = uuid.v4(); // Generates a unique ID for the file
	  const fileExtension = file.originalname.split('.').pop(); // Gets the file extension
	  const newFilename = uniqueId + '.' + fileExtension; // Concatenates the unique ID and file extension
	  cb(null, newFilename);
	}
  });

app = express();
const upload = multer({storage: storage});
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

// simple data route to verify that data is being gathered, this will be modified accordingly after implementing
// the login system.
app.get("/data", async (req, res) => {
	const guests = await db.all("SELECT * FROM guest");
	const organizers = await db.all("SELECT * FROM organizer");
	res.json({guests: guests, organizers: organizers});
});

app.get("/", function (req, res) {
    res.send("test");
});

app.get("/guest", (req, res) => {
	res.sendFile(__dirname + "/guestTemplate.html")
});
//sends the event name based on its ID
app.get("/eventName/:eventId", async (req, res) => {
	const eventId = req.params.eventId;
	const eventName = await db.get("SELECT eventName FROM event WHERE id = ?", eventId);
	res.json(eventName);
});

//sends an event image unique name
app.get("/eventImages/:eventId", async(req, res) => {
	const eventId = req.params.eventId;
	const imgData = await db.get("SELECT file FROM guest WHERE event_id = ?", eventId);
	res.json(imgData);
});

//sends the eventNames and ids for a specified organizer
app.get("/eventData/:organizerID", async(req, res) => {
	const eventNames = await db.all("SELECT id, eventName FROM event WHERE organizerID = ?", req.params.organizerID);
	res.json(eventNames);
});
//sends the guestData(id, name, message and files)
app.get("/guestData/:eventID", async(req, res) => {
	const guestNames = await db.all("SELECT id, name, message, file FROM guest where event_id = ?", req.params.eventID);
	res.json(guestNames);
});
app.get("/accessCode/:eventID", async(req, res) => {
	const accessCode = await db.get("SELECT accessCode FROM event WHERE id = ?", req.params.eventID);
	res.json(accessCode);
});

app.get("/sessionID/:organizerID", async(req, res) => {
	const organizerID = req.params.organizerID;
	const sessionID = await db.get("SELECT sessionID FROM organizer WHERE id = ?", organizerID);
	res.send(sessionID);
})

app.get("/username/:username", async (req, res) => {
	const username = req.params.username;
	const result = await db.get("SELECT username FROM organizer WHERE username = ?", username);
	res.send(result);
})

app.get('/login/:username', async (req, res) => {
	const username = req.params.username;
	const row = await db.get('SELECT password, id FROM organizer WHERE username = ?', username);
	res.send(row);
});

//uploads data from guest into database
app.post("/guest/:eventId", upload.single('file'), async(req, res) => {
	const eventId = req.params.eventId;
	await db.run("INSERT INTO guest (name, event_id, message, file) VALUES (?, ?, ?, ?)", [req.body.name, eventId, req.body.message, req.file.filename]);
	res.sendFile(__dirname + "/guestTemplate.html");
});

app.post("/organizer/:id/eventCreation/:eventName/:accessCode", async(req, res) =>{
	const eventName = req.params.eventName;
	const eventID = req.params.id;
	const accessCode = req.params.accessCode;
	await db.run(`INSERT INTO event (eventName, organizerID, accessCode) VALUES (?, ?, ?) `,[eventName, eventID, accessCode]);
	res.send("success");
});

app.post("/organizer/eventDeletion/:eventID", async(req, res) =>{
	const eventID = req.params.eventID;
	await db.run(`DELETE FROM event WHERE id = ?`, eventID);
	await db.run('DELETE FROM guest WHERE event_id = ?', eventID);
	res.send("success");
});

app.post("/signup", async(req, res) =>{
	const userName = req.body.username;
	const hashedPassword = req.body.hashedPassword;
	const name = req.body.name;
	const response = await db.run(`INSERT INTO organizer (username, password, name) VALUES(?, ?, ?)`, [userName, hashedPassword, name]);
	res.send("success");
})

app.post('/sessionID', async (req, res) => {
	const sessionID = req.body.sessionID;
	const organizerID = req.body.organizerID;
	const response = await db.run("UPDATE organizer SET sessionID = ? WHERE id = ?", [sessionID, organizerID]);
	res.send("success");
})
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
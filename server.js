const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

PORT=8080;

// connect to db
let db;
(async () => {
	db = await open({
		filename: 'database.db',
		driver: sqlite3.Database
	});
})();

app = express();
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// simple data route to verify that data is being gathered, this will be modified accordingly after implementing
// the login system.
app.get("/data", async (req, res) => {
	const guests = await db.all("SELECT * FROM guest");
	const organizers = await db.all("SELECT * FROM organizer");

	console.log(guests);
	console.log(organizers);
	
	res.json({guests: guests, organizers: organizers});
});

app.get("/", function (req, res) {
    res.send("test");
});

app.get("/guest:id", (req, res) => {
	res.sendFile(__dirname + "/guestTemplate.html")
	console.log("this is the guest get request");
});
app.post("/guest:id", async(req, res) => {
	console.log("this is the post request");
	console.log(req);
	await db.run("INSERT INTO guest (name, event_id, file) VALUES (?, ?, ?)", [req.body.name, req.params.id, req.body.file]);
	res.sendFile(__dirname + "/guestTemplate.html");   
});
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
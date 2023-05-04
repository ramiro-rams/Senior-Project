import './App.css';
import React, { useEffect } from "react";
import {BrowserRouter as Router ,Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import {useState} from "react";
import {useParams, Link} from "react-router-dom";
import {v4 as uuidv4} from 'uuid';
import bcrypt from 'bcryptjs'

function Welcome(){
  return(
    <>
    <h1>Welcome to Guestbook</h1>
    <Link to="/login">
    <button>Login</button>
    </Link>
    <Link to="/signup">
    <button>Signup</button>
    </Link>
    </>
  )
}
function Login(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      //gets the hashed password
      const response = await axios.get(`http://localhost:8080/login/${username}`);
      bcrypt.compare(password, response.data.password, async function(err, result) {
        if (result === true) {
        const sessionID = uuidv4();
        sessionStorage.setItem("sessionID", sessionID);
        await axios.post('http://localhost:8080/sessionID', {
          sessionID: sessionID,
          organizerID: response.data.id
        })
        setLoginError(false);
          navigate(`/organizer/${response.data.id}`);
      } else {
        setLoginError(true);
      }
    });
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <form onSubmit={handleLogin}>
      <label>
        Username:
        <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
      </label>
      <label>
        Password:
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      {loginError && <div>Invalid username or password.</div>}
      <button type="submit">Log In</button>
    </form>
  );
};

function SignUp(){
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState();
  const [userNameTaken, setUserNameTaken] = useState();
  const navigate = useNavigate();

  console.log(userNameTaken);
  const handleSignUp = async (event) => {
    event.preventDefault();
    try{
      //checking if username is in database
      const usernameExists = await axios.get(`http://localhost:8080/username/${username}`);
      console.log(usernameExists.data.username);
      if(usernameExists.data.username){
        setUserNameTaken(true);
        console.log("username taken = " + userNameTaken);
      }
      else{ 
        setUserNameTaken(false);
        console.log("username taken = " + userNameTaken);
      }
      if (password1 !== password2) {
        setPasswordMatchError(true);
      } else {
        setPasswordMatchError(false);
      }
    }catch(error){
      console.log(error);
    }
  }
  useEffect(() =>{
    const fetch = async() =>{
      try{
        //do this if username is not taken and both passwords match
        if(userNameTaken == false && passwordMatchError == false){
          //generating salt for encryption
          console.log("username taken = " + userNameTaken)
          const salt = bcrypt.genSaltSync(10)
          //encrypting
          const hashedPassword = bcrypt.hashSync(password1, salt)
          await axios.post(`http://localhost:8080/signup`, {
            username: username,
            hashedPassword: hashedPassword,
            name: name
          });
        navigate("/login");
      }
    }catch(error){
        console.log(error)
    }
  }
    fetch();
  }, [passwordMatchError, userNameTaken])
  return(
    <>
    <h1>SignUp</h1>
    <form onSubmit={handleSignUp}>
    <label>
        Name:
        <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <br/>
      <label>
        Username:
        <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
      </label>
      <br/>
      <label>
        Password:
        <input type="password" value={password1} onChange={(event) => setPassword1(event.target.value)} />
      </label>
      <br/>
      <label>
        Confirm Password:
        <input type="password" value={password2} onChange={(event) => setPassword2(event.target.value)} />
      </label>
      {passwordMatchError && <div>Passwords do not match.</div>}
      {userNameTaken && <div>That username is already taken</div>}
      <br/>
      <button type="submit">Sign Up</button>
    </form>
    </>
  );
}

function GuestData({name, message, fileName}){
  return(
    <>
    <h3>{name}</h3>
    <p>{message}</p>
    <img height="100" src={`\\images\\${fileName}`}></img>
    </>
  );
}

function Event(){
  const[guestNames, setGuestNames] = useState([]);
  const params = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const fetch = async () => {
      try {
        const sessionID = sessionStorage.getItem("sessionID");
        const sessionCheck = await axios.get(`http://localhost:8080/sessionID/${params.organizerID}`);
        if(sessionID !== sessionCheck.data.sessionID){
          navigate(`/login`)
        }
        const response = await axios.get(`http://localhost:8080/guestData/${params.eventID}`);
        setGuestNames(response.data);
      } catch(error){
        console.log(error);
      }
    }
    fetch();
  }, []);
  const guestNameElements = guestNames.map((object) => <GuestData key={object.id} name={object.name} message={object.message} fileName={object.file}/>);
  return(
    <>
    <div>
    <h1>Guests</h1>
    <div>
      <div>
        {guestNameElements}
      </div>
    </div></div>
    </>
    
  );
};
function Organizer(){
  const [eventName, setEventName] = useState('');
  const [eventDataArr, setEventDataArr] = useState([]);
  const[eventNameElements, setEventNameElements] = useState([]);
  const [code, setCode] = useState();
  const organizerID = useParams();
  const navigate = useNavigate();

  function createEventNameElement(eventData, index){
    const handleDelete = async()=>{
        try{
            //deleting an event from the database
            const response = await axios.post(`http://localhost:8080/organizer/eventDeletion/${eventData.id}`);
            setEventDataArr(eventDataArr.filter((element, i) => i !== index));
        }
        catch(error){
          console.log(error);
        }
    };
    return <div key={eventData.id}> <h3><a href={`../event/${eventData.id}/${organizerID.organizerID}`}>{eventData.eventName}</a></h3><button onClick={handleDelete}>Delete</button></div>
  };
  //getting the event data and setting the states for the first time
  useEffect(() => {
    const fetch = async () => {
      try {
        const sessionID = sessionStorage.getItem("sessionID");
        const sessionCheck = await axios.get(`http://localhost:8080/sessionID/${organizerID.organizerID}`);
        if(sessionID !== sessionCheck.data.sessionID){
          navigate(`/login`)
        }
        //getting the event
        const response = await axios.get(`http://localhost:8080/eventData/${organizerID.organizerID}`);
        setEventDataArr(response.data);
      } catch(error) {
        console.log(error);
      }
    };
    fetch();
  },[]);

  //this updates the eventNameElements state every time the eventDataArr state changes
  useEffect(() =>{
    const fetch = async () =>{
      setEventNameElements(eventDataArr.map((eventData, index) => createEventNameElement(eventData, index)));
    }
    fetch();
  },[eventDataArr])

  const handleSubmit = async(event) =>{
    event.preventDefault();
    try{
      //inserting new event into database
      const post = await axios.post(`http://localhost:8080/organizer/${organizerID.organizerID}/eventCreation/${eventName}/${code}`)
      //getting the new array of events in the database
      const response = await axios.get(`http://localhost:8080/eventData/${organizerID.organizerID}`);
      setEventDataArr(response.data);
    }
    catch(error) {
      console.log(error);
    }
  };

  const handleNameChange = async(event) => {
    setEventName(event.target.value);
  }
  const handleCodeChange = async(event) => {
    setCode(event.target.value);
  }
  
  return (
    <>
    <h1>My Events</h1>
        <h2>Previous Events</h2>
        <div>
          {eventNameElements}
        </div>
        <h1>Create Your Event</h1>
        <form onSubmit = {handleSubmit}>
        <label htmlFor="Name">
          Event Name:
        </label>
        <input id="Name" type="text" onChange={handleNameChange}></input>
        <br></br>
        <label htmlFor="AccessCode">
          Access Code:
        </label>
        <input id="AccessCode" type="text" onChange={handleCodeChange}></input>
        <br></br>
        <button disabled={!eventName}>Submit</button>
        </form>
    </>
  );
};

function Guest (){
  const [eventName, setEventName] = useState('');
  const[name, setName] = useState('');
  const[message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const[accessCode, setAccessCode] = useState('');
  const[validAccessCode, setValidAccessCode] = useState('');
  const[codeAccessValid, setCodeAccessValid] = useState(false);

  const eventID = useParams();
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        //getting the event name the guest is attending
        const response = await axios.get(`http://localhost:8080/eventName/${eventID.eventID}`);
        const validCode= await axios.get(`http://localhost:8080/accessCode/${eventID.eventID}`);
        setValidAccessCode(validCode.data.accessCode);
        setEventName(response.data.eventName);
        setLoading(false);
      } catch(error) {
        setSubmitError("unable to retrieve data from server");
      }
    };
    fetch();
  }, []);
  const handleAccessCodeSubmit = (event) => {
    event.preventDefault();
    if(validAccessCode == accessCode){
      setCodeAccessValid(true);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try{
      const formData = new FormData();
      formData.append('name', name);
      formData.append('message', message);
      formData.append('file', file);
      //submitting data guest inputed
      const response = await axios.post(`http://localhost:8080/guest/${eventID.eventID}`, formData);
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
    {
      !codeAccessValid && 
      <form onSubmit={handleAccessCodeSubmit}>
      <label>
        Access Code:
        <input type="text" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} />
      </label>
      <button type="submit">Submit</button>
    </form>
    }
    {codeAccessValid && <div><h1>Welcome to {eventName} </h1>
    <form onSubmit = {handleSubmit} id="guestForm" encType="multipart/form-data">
      <label htmlFor="name">First name:</label><br />
      <input type="text" id="name" name="name" onChange={(event) => setName(event.target.value)}/><br />
      <label htmlFor="message">Type message here:</label><br />
      <textarea id="message" name="message" rows="4" cols="50" onChange={(event) => setMessage(event.target.value)}></textarea><br />
      <label htmlFor="media">Upload media here:</label><br />
      <input type="file" onChange = {(event) => setFile(event.target.files[0])}/><br />
      <button type="submit" form="guestForm" disabled={isSubmitting}>Submit</button>
    </form></div>}
  </>
  );
}

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path = "/signup" element={<SignUp/>}/>
      <Route path = "/organizer/:organizerID" element ={<Organizer/>}/>
      <Route path="/guest/:eventID" element ={<Guest/>} />
      <Route path="/event/:eventID/:organizerID" element ={<Event/>}/>
      <Route path="/welcome" element ={<Welcome/>}/>
    </Routes>
  </Router>
  );
}

export default App;
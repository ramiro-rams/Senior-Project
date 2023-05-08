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
    <div className="containerWelcome">
      <h1>Welcome to Guestbook</h1>
      <p>This platform lets you create virtual guestbooks for your most important events.</p> 
      <p>Whether you're planning a wedding, a funeral, an art gallery, or a party, Guestbook makes it easy for you to create a digital space where your guests can leave their well wishes, share their memories, and celebrate with you.</p>
      <p>To get started, simply sign in if you already have an account, or sign up if you're new to Guestbook. With our user-friendly platform, you'll be able to create your guestbook in no time, and invite your guests to start leaving their messages. We can't wait to help you make your event even more special with Guestbook.</p>
      <Link to="/login">
        <button className="styled-btn">Sign In</button>
      </Link>
      <Link to="/signup">
        <button className="styled-btn">Sign Up</button>
      </Link>
    </div>
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
    <>
      <nav className="navbar">
        <div className="navbar__logo"><a href="./welcome">Guestbook</a></div>
      </nav>

      <div className="container">
        <form onSubmit={handleLogin}>
          <label>
            Username:
            <input type="text" id="username" name="username" placeholder="Enter your username" value={username} onChange={(event) => setUsername(event.target.value)}/>
          </label>
          <label>
            Password:
            <input type="password" id="password" name="password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)}/>
          </label>
          {loginError && <div>Invalid username or password.</div>}
          <button className="styled-btn" type="submit">Log In</button>
        </form>
      </div>
    </>
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
  const handleSignUp = async (event) => {
    event.preventDefault();
    try{
      //checking if username is in database
      const usernameExists = await axios.get(`http://localhost:8080/username/${username}`);
      if(usernameExists.data.username){
        setUserNameTaken(true);
      }
      else{ 
        setUserNameTaken(false);
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
      <nav className="navbar">
        <div className="navbar__logo"><a href="./welcome">Guestbook</a></div>
      </nav>

      <div className="container">
        <form onSubmit={handleSignUp}>
          <label>
            Name:
            <input type="text" value={name} placeholder="Full name" onChange={(event) => setName(event.target.value)}/>
          </label>

          <label>
            Username:
            <input type="text" value={username} placeholder="Username" onChange={(event) => setUsername(event.target.value)}/>
          </label>

          <label>
            Password:
            <input type="password" value={password1} placeholder="Password" onChange={(event) => setPassword1(event.target.value)}/>
          </label>

          <label>
            Confirm Password:
            <input type="password" value={password2} placeholder="Confirm" onChange={(event) => setPassword2(event.target.value)} />
          </label>

          {passwordMatchError && <div>Passwords do not match.</div>}
          {userNameTaken && <div>That username is already taken.</div>}

          <button type="submit" className="styled-btn">Sign Up</button>
        </form>
      </div>
    </>
  );
}

function GuestData({guestID, name, message, fileData, manageContentToggled}){

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      // Implement code to delete image here
      await axios.post(`http://localhost:8080/deleteImage` ,{
        imageID: id
      })
      //removing the corresponding image container from the DOM
      const container = document.getElementById(`imageContainer_${id}`);
      if (container) {
        container.remove();
      }
    }
  }
  const handleDeleteName = async (id) => {
    if(window.confirm('Are you sure you want to delete this name?')) {
      await axios.post(`http://localhost:8080/deleteName`, {
        guestID: id
      })
      const container = document.getElementById(`name_${id}`);
      if (container) {
        container.remove();
      }
    }
  }
  const handleDeleteMessage = async (id) => {
    if(window.confirm('Are you sure you want to delete this message?')) {
      await axios.post(`http://localhost:8080/deleteMessage`, {
        guestID: id
      })
      const container = document.getElementById(`message_${id}`);
      if (container) {
        container.remove();
      }
    }
  }
  return(
    <div className="container">
    {name != null && <h3 id={`name_${guestID}`}>{name} {manageContentToggled && <button onClick={() => handleDeleteName(guestID)}>Delete</button>}</h3>}
    {message != null && <p id={`message_${guestID}`}>{message}{manageContentToggled && <button onClick={() => handleDeleteMessage(guestID)}>Delete</button>}</p>}
    <div>
      {fileData.map((data) => 
        <div id={`imageContainer_${data.ID}`} key ={data.ID}>
          <img src={`\\images\\${data.fileName}`}></img><br></br>
          {manageContentToggled && <button onClick={() => handleDelete(data.ID)}>Delete</button>}
        </div>)}
    </div>
    </div>
  );
}

function Event(){
  const[guestData, setGuestData] = useState([]);
  const[manageContentToggled, setManageContentToggled] = useState(false);
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
        setGuestData(response.data);
      } catch(error){
        console.log(error);
      }
    }
    fetch();
  }, []);

  useEffect(()=>{
    console.log(manageContentToggled);
  },[manageContentToggled])

  const handleDownload = async () => {
      try{
        const response = await axios.get(`http://localhost:8080/guestData/${params.eventID}`);
        response.data.forEach((object)=>{
          object.fileData.forEach((data, index)=>{
            const link = document.createElement('a');
            link.download = `guest_${object.name}_${index}`;
            link.href = `\\images\\${data.fileName}`;
            link.click();
          });
        })
      } catch(error){
        console.log(error);
      }
  }
  const guestNameElements = guestData.map((object) => <GuestData key={object.id} guestID={object.id} name={object.name} message={object.message} fileData={object.fileData} manageContentToggled={manageContentToggled}/>);
  return(
    <>
    <div>
      <h1>Guests</h1>
      {!(guestData.length > 0) && <h2>Once the guests upload their submissions, you will see the content here.</h2>}
      <div>
        {guestData.length > 0 &&
        <div>
        <button className="styled-btn" onClick = {handleDownload}>Download Images</button>
        <button className="styled-btn" onClick = {()=>setManageContentToggled(!manageContentToggled)}>Manage Content</button>
        </div>
        }
        <div>
          {guestNameElements}
        </div>
      </div>
    </div>
    </>
    
  );
};
function Organizer(){
  const [eventName, setEventName] = useState('');
  const [eventDataArr, setEventDataArr] = useState([]);
  const [eventNameElements, setEventNameElements] = useState([]);
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
    return <div className ="containerEvent" key={eventData.id}> <h3><a href={`../event/${eventData.id}/${organizerID.organizerID}`}>{eventData.eventName}</a></h3><p>Access Code: {eventData.accessCode}</p><p>Guest Link: <a href={`http://localhost:3000/guest/${eventData.id}`}>http://localhost:3000/guest/{eventData.id}</a></p><button className="delete-btn" onClick={handleDelete}>Delete</button></div>
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
      <h10>Previous Events</h10>
      <div>
        {eventNameElements}
      </div>
      <div className="container">
        <h2>Create Your Event</h2>
        <form onSubmit = {handleSubmit}>
          <label htmlFor="Name">
            Event Name:
          </label>
          <input id="Name" type="text" placeholder="Enter your event name" onChange={handleNameChange}></input>
      
          <label htmlFor="AccessCode">
            Access Code:
          </label>
          <input id="AccessCode" type="text" placeholder="Create a unique access code" onChange={handleCodeChange}></input>

          <button className="styled-btn" disabled={!eventName}>Submit</button>
        </form>
      </div>
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
      if (file !== null) {
        for(let i = 0; i < file.length; ++i){
          formData.append('file', file[i]);
        }
      }
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
      <div className="container">
        <form onSubmit={handleAccessCodeSubmit}>
          <label>
            Access Code:
            <input type="text" value={accessCode} placeholder="Enter access code" onChange={(event) => setAccessCode(event.target.value)} />
          </label>
          <button className="styled-btn" type="submit">Submit</button>
        </form>
      </div>
    }
    {codeAccessValid && 
    <div>
      <h2>Welcome to</h2>
      <h5>{eventName}</h5>
      <div className="container">
        <form onSubmit = {handleSubmit} id="guestForm" encType="multipart/form-data">
          <label htmlFor="name">First name:</label>
          <input type="text" id="name" name="name" placeholder='Please enter your name' onChange={(event) => setName(event.target.value)}/><br />
          <label htmlFor="message">Type message here:</label>
          <textarea placeholder='Please enter your message' id="message" name="message" rows="4" cols="50" onChange={(event) => setMessage(event.target.value)}></textarea><br />
          <label htmlFor="media">Upload media here:</label>
          <input multiple type="file" onChange = {(event) => setFile(event.target.files)}/><br />
          <button className="styled-btn" type="submit" form="guestForm" disabled={isSubmitting}>Submit</button>
        </form>
      </div>
    </div>}
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
import './App.css';
import React, { useEffect } from "react";
import {BrowserRouter as Router ,Routes, Route, Redirect, redirect } from "react-router-dom";
import axios from "axios";
import {useState} from "react";
import {useParams} from "react-router-dom";

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
  const[guestNames, setGuestNames] = useState([])
  const eventID = useParams();
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/guestData/${eventID.eventID}`);
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
    <h1>Guests</h1>
    <div>
      <div>
        {guestNameElements}
      </div>
    </div>
    </>
  );
};
function Organizer(){
  const [eventName, setEventName] = useState('');
  const [eventDataArr, setEventDataArr] = useState([]);
  const[eventNameElements, setEventNameElements] = useState([]);
  const organizerID = useParams();

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
    return <div key={eventData.id}> <h3><a href={`../event/${eventData.id}`}>{eventData.eventName}</a></h3><button onClick={handleDelete}>Delete</button></div>
  };
  //getting the event data and setting the states for the first time
  useEffect(() => {
    const fetch = async () => {
      try {
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
      const post = await axios.post(`http://localhost:8080/organizer/${organizerID.organizerID}/eventCreation/${eventName}`)
      //getting the new array of events in the database
      const response = await axios.get(`http://localhost:8080/eventData/${organizerID.organizerID}`);
      setEventDataArr(response.data);
    }
    catch(error) {
      console.log(error);
    }
  };

  const handleChange = async(event) => {
    setEventName(event.target.value);
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
        <input id="Name" type="text" onChange={handleChange}></input>
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

  const eventID = useParams();
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        //getting the event name the guest is attending
        const response = await axios.get(`http://localhost:8080/eventName/${eventID.eventID}`);
        setEventName(response.data.eventName);
        setLoading(false);
      } catch(error) {
        setSubmitError("unable to retrieve data from server");
      }
    };
    fetch();
  }, []);

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
    <h1>Welcome to {eventName} </h1>
    <form onSubmit = {handleSubmit} id="guestForm" encType="multipart/form-data">
      <label htmlFor="name">First name:</label><br />
      <input type="text" id="name" name="name" onChange={(event) => setName(event.target.value)}/><br />
      <label htmlFor="message">Type message here:</label><br />
      <textarea id="message" name="message" rows="4" cols="50" onChange={(event) => setMessage(event.target.value)}></textarea><br />
      <label htmlFor="media">Upload media here:</label><br />
      <input type="file" onChange = {(event) => setFile(event.target.files[0])}/><br />
      <button type="submit" form="guestForm" disabled={isSubmitting}>Submit</button>
    </form>
  </>
  );
}

function App() {
  return (
    <Router>
    <Routes>
      <Route path = "/organizer/:organizerID" element ={<Organizer/>}/>
      <Route path="/guest/:eventID" element ={<Guest/>} />
      <Route path="/event/:eventID" element ={<Event/>}/>
    </Routes>
  </Router>
  );
}

export default App;
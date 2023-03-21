import './App.css';
import React, { useEffect } from "react";
import {BrowserRouter as Router ,Routes, Route, Redirect } from "react-router-dom";
import axios from "axios";
import {useState} from "react";
import {useParams} from "react-router-dom";
function Organizer(){
  return (
    <>
    <h1>My Events</h1>
        <h2>Previous Events</h2>

        <div>
            <div>
                <h3><a href="">Name of previous event 1</a></h3>
                <div>Event date: [date]</div>
            </div>

            <div>
                <h3><a href="">Name of previous event 1</a></h3>
                <div>Event date: [date]</div>
            </div>
        </div>

        <button id="newEvent">Plan New Event</button>
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
        const response = await axios.get(`http://localhost:8080/eventName/${eventID.eventID}`);
        setEventName(response.data.event_name);
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
      const response = await axios.post('http://localhost:8080/guest', formData);
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
      <Route path = "/organizer" element ={<Organizer/>}/>
      <Route path="/guest/:eventID" element ={<Guest/>} />
    </Routes>
  </Router>
  );
}

export default App;
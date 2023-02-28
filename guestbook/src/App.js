import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <>
      <h1>Welcome to [Event Name]</h1>
      <form id="guestForm">
        <label htmlFor="name">First name:</label><br />
        <input type="text" id="name" name="name" /><br />
        <label htmlFor="message">Type message here:</label><br />
        <textarea id="message" name="message" rows="4" cols="50"></textarea><br />
        <label htmlFor="media">Upload media here:</label><br />
        <input type="file" /><br />
        <button type="submit" form="guestForm">Submit</button>
      </form>
    </>
  );
}

export default App;

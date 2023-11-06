import React, { useState, useEffect } from 'react';
import WebSocketServer from 'ws';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false)
  const socket = new WebSocket('ws://localhost:8000/ws/1'); // Promenite URL prema vašem WebSocket backendu

  useEffect(() => {
    getMessages()
  }, [])

  useEffect(() => {
    socket.onmessage = (event) => {
      const newMessage = event.data;
      setMessages([...messages, newMessage]);
    };

    return () => {
      socket.close();
    };
  }, [messages]);

  const chatContainerStyle = {
    width: '400px',
    margin: '0 auto',
  };
  
  const messageContainerStyle = {
    height: '300px',
    border: '1px solid #ccc',
    padding: '10px',
    overflowY: 'scroll',
  };
  
  const inputContainerStyle = {
    display: 'flex',
  };
  
  const inputStyle = {
    flex: '1',
    marginRight: '10px',
  };

  const buttonStyle = {
    padding: '8px 16px',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  };

  const getMessages = () => {
    fetch('http://localhost:8000/messages/1/2')
    .then((response) => {
      if (response.ok){
        return response.json()
      }
      throw response
    })
    .then(data => {
      console.log(data)
      setMessages(data)
      setIsLoaded(true)
    })
  }

  const sendMessageToServer = (message) => {
    const messageData = {
      sender_id: 1,  // ID trenutno prijavljenog korisnika (možete promeniti ovo prema vašim potrebama)
      receiver_id: 2,  // ID primaoca poruke
      content: message,
    };

    fetch('http://localhost:8000/messages/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Neuspešan zahtev');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Poruka uspešno poslata na server:', data);
        // Dodajte poruku u lokalni state kako biste je odmah 
        setMessages([...messages, data.content]);
      })
      .catch((error) => {
        console.error('Greška prilikom slanja poruke:', error);
      });
  };

  const sendMessage = () => {
    if (message.trim() !== '') {
      sendMessageToServer(message);
      setMessage('');
    }
  };
  return (
    <div style={chatContainerStyle}>
      <div style={messageContainerStyle}>
        {isLoaded && messages.map((msg, idx) => (
          <div key={idx}>{msg.content}</div>
        ))}
      </div>
      <div style={inputContainerStyle}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={inputStyle}
        />
        <button onClick={sendMessage} style={buttonStyle}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
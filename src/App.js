import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";



function App() {

  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId] = useState(Number)
  const [roomNumber, setRoomNumber] = useState(0)
  const [socket, setSocket] = useState(new WebSocket('ws://localhost:8000/ws/'+roomNumber))
  const [openLogin, setOpenLogin] = useState(false)
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState('')
  const messagesRef = useRef(null)
  const [image, setImage] = useState(null)
  const [documents, setDocuments] = useState(null)
  const [videos, setVideos] = useState(null)
  useEffect(() => {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, []);

  const imageStyle = {
    width: '100%',
    height: '100%', 
    objectFit: 'contain',
    borderRadius: '10px',
    border: '1px solid black'
  }

  const imageSender = {
    height: '100px',
    transform: 'translateX(100%)',
    maxWidth: '50%',
    width: 'auto',
    boxSizing: 'border-box',
    margin: '3px 0px',
    borderRadius: '10px'
  }

  const imageReceiver = {
    height: '100px',
    maxWidth: '50%',
    width: 'auto',
    boxSizing: 'border-box',
    margin: '3px 0px',
    borderRadius: '10px'

  }

  const receiver = {
    textAlign: 'left',
    color: 'red', 
    border: '1px solid #caa',
    backgroundColor: '#f57358',
    maxWidth: '50%',
    width: 'auto',
    padding: '2px',
    boxSizing: 'border-box',
    margin: '5px 0px',
    borderRadius: '5px',
    height: 'auto',
    wordWrap: 'break-word',
    textDecoration: 'none'
  }

  const documentStyle = {
    textDecoration: 'none',
    color: '#ff0000'
  }

  const sender = {
    textAlign: 'right',
    color: 'green',
    border: '1px solid #caa',
    backgroundColor: '#9ef781',
    maxWidth: '50%',
    width: 'auto',
    padding: '2px',
    boxSizing: 'border-box',
    margin: '5px 0px',
    borderRadius: '5px',
    transform: 'translateX(100%)',
    wordWrap: 'break-word',
    textDecoration: 'none'
  }

  const chatContainerStyle = {
    width: '400px',
    margin: '0 auto',
  };
  
  const messageContainerStyle = {
    height: '300px',
    border: '1px solid #ccc',
    padding: '10px',
    overflowY: 'scroll',
    display: 'flex',
    flexDirection: 'column'
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

  const loginContainer =  {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
      background: 'black',
      position: 'absolute',
      width: 400,
      border: '2px solid #000000',
      padding: '10px'
  }

  const getMessages = (sender, receiver) => () => {
    socket.close()
    setReceiverId(Number(receiver))
    fetch('http://localhost:8000/messages/'+sender+'/'+receiver)
    .then((response) => {
      if (response.ok){
        return response.json()
      }
      throw response
    })
    .then(data => {
      console.log(data)
      setMessages(data)
      //setIsLoaded(true)
      console.log(receiverId)
    })

    fetch('http://localhost:8000/room_number/'+sender+'/'+receiver)
    .then((response)=>{
      if(response.ok){
        return response.json()
      }
      throw response
    })
    .then(data => {
      setRoomNumber(data.id)
      var input = document.getElementById('messageText')
      input.defaultValue = ''
      var messages_ = document.getElementById('messages')
      messages_.innerHTML = ''
      setSocket(new WebSocket('ws://localhost:8000/ws/'+data.id))
      
    })
    const container = messagesRef.current;
    container.scrollBottom = container.scrollHeight;

  }

 

  const sendMessage = (sender, receiver)=> () => {
      var input = document.getElementById('messageText')
      if(input.value.trim !== ''){
        socket.send(JSON.stringify({'message':input.value, 'sender_id': sender, 'receiver_id': receiver, 'type_of_message': 'text'}))
        input.value = ''
        socket.onmessage = (e) => {
          var messages = document.getElementById('messages')
          var message = document.createElement('div')
          var new_mess = JSON.parse(JSON.parse(e.data))
          if(new_mess.sender_id === userId){
            message.setAttribute("style", "transform: translateX(100%); text-align: right; color: green;border: 1px solid #caa;background-color: #9ef781;max-width: 50%;width: auto;padding: 2px;box-sizing: border-box;margin: 5px 0px;border-radius: 5px;height: auto;word-wrap: break-word;")  
      
          }
          else{
            message.setAttribute("style", "text-align: left;color: red;border: 1px solid #caa;background-color: #f57358;max-width: 50%;width: auto;padding: 2px;box-sizing: border-box;margin: 5px 0px;border-radius: 5px;height: auto;word-wrap: break-word;") 
          }
          var content = document.createTextNode(new_mess.message)
          message.appendChild(content)
          messages.appendChild(message)
      }
    }
  };

  const Login = (event) => {
    event?.preventDefault()
    const json_string = JSON.stringify({
      username: username
    })

    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: json_string
    }

    fetch('http://localhost:8000/login', requestOptions)
    .then(response => {
      if(response.ok){
        return response.json()
      }
      throw response
    })
    .then(data => {
      Cookies.set('id', data.id)
      setUserId(data.id)
      getUsers(data.id)
    })
    .catch(error => {
      console.log(error);
      alert(error)
    })
    //setOpenLogin(false)
  }

  const getUsers = (userID) => {
    fetch('http://localhost:8000/users/'+userID)
    .then((response) => {
      if(response){
        return response.json()
      }
      throw response
    })
    .then(data=>{
      setUsers(data)
    })
  }
  

  const uploadChatImage = (e) => {
    if (e.target.files[0]){
      setImage(e.target.files[0])
    }
  }

  const handleUploadChatImage = (e) => {
    e?.preventDefault()
    const formData = new FormData()
    formData.append('image', image)
    const requestOptions = {
      'method': 'POST',
      body: formData
    }
    fetch('http://localhost:8000/'+'image', requestOptions)
    .then(response => {
      if(response.ok){
        return response.json()
      }
      throw response
    })
    .then(data => {
      uploadImage(data.filename)
    })
    .catch(error => {
      console.log(error)
    })
    .finally(() => {
        setImage(null)
        document.getElementById('fileInput').value = null
    })
  }

  const uploadImage = (imageURL) =>{
    const json_string = JSON.stringify({
      'image_name': imageURL,
      'sender_id': userId,
      'receiver_id': receiverId,
      'room_id': roomNumber
    })
    const requestOptions = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: json_string
    }
    fetch('http://localhost:8000'+'/chat_image', requestOptions)
    .then(response => {
      if(response.ok){
        return response.json()
      }
      throw response
    })
    .then(data => {
      console.log("DATA", data)
      if(imageURL !== ''){
        socket.send(JSON.stringify({'message':data.image_name, 'sender_id': userId, 'receiver_id': receiverId, 'type_of_message': 'image'}))
        socket.onmessage = (e) => {
          console.log(JSON.parse(JSON.parse(e.data)).message.split('/')[1])
          var iU = JSON.parse(JSON.parse(e.data)).message
          var messages = document.getElementById('messages')
          var image = document.createElement('img')
          var new_div = document.createElement('div')
          
          var new_mess = JSON.parse(JSON.parse(e.data))
          if(new_mess.sender_id == userId){
            new_div.setAttribute("style", "height: 100px; transform: translateX(100%); max-width: 50%; width: auto; box-sizing: border-box; margin: 3px 0px; border-radius: 10px")
            image.setAttribute("src", 'http://localhost:8000/'+iU)  
            image.setAttribute("style", "width: 100%; height: 100%;  object-fit: contain; border-radius: 10px; border: 1px solid black")

          }
          else{
            new_div.setAttribute("style", "height: 100px; max-width: 50%; width: auto; box-sizing: border-box; margin: 3px 0px; border-radius: 10px")
            image.setAttribute("src", 'http://localhost:8000/'+iU) 
            image.setAttribute("style", "width: 100%; height: 100%;  object-fit: contain; border-radius: 10px; border: 1px solid black")
          }
          var content = document.createTextNode(new_mess.message)
          image.appendChild(content)
          new_div.appendChild(image)
          messages.appendChild(new_div)
      }
    }
    })
  }

  const uploadChatDocument = (e) => {
    if (e.target.files[0]){
      setDocuments(e.target.files[0])
    }
  }

  const handleUploadChatDocument = (e) => {
    e?.preventDefault()
    const formData = new FormData()
    formData.append('document', documents)
    const requestOptions = {
      'method': 'POST',
      body: formData
    }
    fetch('http://localhost:8000/'+'documents', requestOptions)
    .then(response => {
      if(response.ok){
        return response.json()
      }
      throw response
    })
    .then(data => {
      uploadDocument(data.filename)
    })
    .catch(error => {
      console.log(error)
    })
    .finally(() => {
        setDocuments(null)
        document.getElementById('fileDocument').value = null
    })
  }

  const uploadDocument = (documentUrl) =>{
    const json_string = JSON.stringify({
      'document_name': documentUrl,
      'sender_id': userId,
      'receiver_id': receiverId,
      'room_id': roomNumber
    })
    const requestOptions = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: json_string
    }
    fetch('http://localhost:8000'+'/chat_documents', requestOptions)
    .then(response => {
      if(response.ok){
        return response.json()
      }
      throw response
    })
    .then(data => {
      if(documentUrl !== ''){
        socket.send(JSON.stringify({'message':data.document_name, 'sender_id': userId, 'receiver_id': receiverId, 'type_of_message': 'document'}))
        socket.onmessage = (e) => {
          var messages = document.getElementById('messages')
          var document_ = document.createElement('a')
          var new_div = document.createElement('div')
          var new_mess = JSON.parse(JSON.parse(e.data))
          console.log(new_mess)
          if(new_mess.sender_id == userId){
            new_div.setAttribute("style", "transform: translateX(100%); text-align: right; color: green; border: 1px solid #caa; background-color: #9ef781; max-width: 50%; width: auto; padding: 2px; box-sizing: border-box; margin: 5px 0px; border-radius: 5px; height: auto; word-wrap: break-word;")
            document_.setAttribute("style", "text-decoration: none; color: #ff0000")
            document_.setAttribute("href", 'http://localhost:8000/'+new_mess.message)  
          }
          else{
            new_div.setAttribute("style", "text-align: left; color: red; border: 1px solid #caa; background-color: #f57358; max-width: 50%; width: auto; padding: 2px; box-sizing: border-box; margin: 5px 0px; border-radius: 5px; height: auto; word-wrap: break-word")
            document_.setAttribute("style", "text-decoration: none; color: #ff0000")
            document_.setAttribute("href", 'http://localhost:8000/'+new_mess.message) 
          }
          var content = document.createTextNode(new_mess.message.split('/')[1])
          document_.appendChild(content)
          new_div.appendChild(document_)
          messages.appendChild(new_div)
      }
    }
    })
  }



  const uploadChatVideo = (e) => {
    if (e.target.files[0]){
      setVideos(e.target.files[0])
    }
  }

  const handleUploadChatVideo = (e) => {
    e?.preventDefault()
    const formData = new FormData()
    formData.append('video', videos)
    const requestOptions = {
      'method': 'POST',
      body: formData
    }
    fetch('http://localhost:8000/'+'videos', requestOptions)
    .then(response => {
      if(response.ok){
        return response.json()
      }
      throw response
    })
    .then(data => {
      uploadVideos(data.filename)
    })
    .catch(error => {
      console.log(error)
    })
    .finally(() => {
        setDocuments(null)
        document.getElementById('fileVideo').value = null
    })
  }

  const uploadVideos = (videoUrl) =>{
    const json_string = JSON.stringify({
      'video_name': videoUrl,
      'sender_id': userId,
      'receiver_id': receiverId,
      'room_id': roomNumber
    })
    const requestOptions = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: json_string
    }
    fetch('http://localhost:8000'+'/chat_video', requestOptions)
    .then(response => {
      if(response.ok){
        return response.json()
      }
      throw response
    })
    .then(data => {
      console.log(data)
      if(videoUrl !== ''){
        socket.send(JSON.stringify({'message':data.video_name, 'sender_id': userId, 'receiver_id': receiverId, 'type_of_message': 'video'}))
        socket.onmessage = (e) => {
          var messages = document.getElementById('messages')
          var new_mess = JSON.parse(JSON.parse(e.data))
          var video = document.createElement('video')
          var source = document.createElement('source')
          console.log(new_mess)
          if(new_mess.sender_id == userId){
            video.setAttribute('controls', 'controls')
            video.setAttribute('style', 'width: 200px; height: 200px')
            source.setAttribute('src', 'http://localhost:8000/'+new_mess.message)
          }
          else{
            video.setAttribute('controls', 'controls')
            video.setAttribute('style', 'width: 200px; height: 200px')
            source.setAttribute('src', 'http://localhost:8000/'+new_mess.message)
          }
          var content = document.createTextNode(new_mess.message)
          source.append(content)
          video.appendChild(source)
          messages.appendChild(video)
      }
    }
    })
  }


  return (
    <div className="app">
      <modal
      open={openLogin}
      onClose={() => setOpenLogin(false)}>
        <div  className={loginContainer}>
          <form>
            <input
            placeholder="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            />
          <button
          type="submit"
          onClick={Login}>Login</button>
          </form>
        </div>

      </modal>
  <div className="users">

      { users.map((user, index) =>
        <div key={index} className="">
          <div className="">
          {user.username}
          </div>
          <div>
            <button 
            className=""
            onClick={getMessages(userId, user.id)}>Send message</button>
        </div>
        </div>
      )
      }
      </div>
    <div className="">
    <div style={chatContainerStyle}>
      <div style={messageContainerStyle} ref={messagesRef}>
        {messages.map((msg, idx) => {
          if(msg.sender_id === userId){
            if(msg.type_of_message==='image'){
            return(
              <div style={imageSender}>   
              <a href={'http://localhost:8000/'+msg.content}> <img alt='' style={imageStyle} key={idx} src={'http://localhost:8000/'+msg.content}/></a>
              </div>
              
            )
            }
            else if(msg.type_of_message==='document'){
              return(
                <div style={sender}>
                <a style={documentStyle} href={'http://localhost:8000/'+msg.content}>{msg.content.split('/')[1]}</a>
                </div>
              )
            }
            else if(msg.type_of_message==='video'){
              return(
                <video width="320" height="240" controls>
                <source src={'http://localhost:8000/'+msg.content} type="video/mp4"/>
                </video> 
              )
            }
            else{
            return(
            <div style={sender} key={idx}>{msg.content}</div>
            )
            }
          }else{
            if(msg.type_of_message==='image'){
              return(
                <div style={imageReceiver}>
                <img style={imageStyle} key={idx} src={'http://localhost:8000/'+msg.content}/>
                </div>
              )
              }
              else if(msg.type_of_message==='document'){
                return (
                  <div style={receiver}>
                  <a style={documentStyle}  href={'http://localhost:8000/'+msg.content} >{msg.content.split('/')[1]}</a>
                  </div>
                )
              }
              else if(msg.type_of_message==='video'){
                return(
                  <video width="320" height="240" controls>
                  <source src={'http://localhost:8000/'+msg.content} type="video/mp4"/>
                  </video> 
                )
              }
              else{
              return(
                <div style={receiver} key={idx}>{msg.content}</div>
              )
              }
          }
        })}    
              <div id='messages'>
              </div>

      </div>
      <div style={inputContainerStyle}>
        <input
          id='messageText'
          autoComplete="off"
          type="text"
          onChange={''}
          style={inputStyle}
        />
        <button onClick={sendMessage(userId, receiverId)} style={buttonStyle}>Send</button> 
        <input 
        type="file"
        id='fileInput'
        onChange={uploadChatImage}/>
        <button
        className="upload-chat-image"
        onClick={handleUploadChatImage}
        >UI</button>
<input 
        type="file"
        id='fileDocument'
        onChange={uploadChatDocument}/>
        <button
        className="upload-chat-image"
        onClick={handleUploadChatDocument}
        >UD</button>

<input 
        type="file"
        id='fileVideo'
        onChange={uploadChatVideo}/>
        <button
        className="upload-chat-image"
        onClick={handleUploadChatVideo}
        >UV</button>
      </div>

      
      
    </div>
    </div>
  </div>
  )
}

export default App;
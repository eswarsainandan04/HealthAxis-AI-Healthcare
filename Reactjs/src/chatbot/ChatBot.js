import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./ChatBot.css";
import aiLogo from './ai.png';  // Import AI logo image
import userLogo from './user.png';  // Import user logo image

const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFinalResponse, setIsFinalResponse] = useState(false); // Track if final response is received
  const [prescriptionText, setPrescriptionText] = useState(""); // Store prescription text

  // Ref for the chat box container to enable auto-scroll
  const chatBoxRef = useRef(null);

  // Ref for the input field to enable auto-focus
  const inputRef = useRef(null);

  // Function to format the message
  const updateMessage = (text) => {
    const formattedText = text
      .replace(/\*\*/g, ' ')        // Replace '**' with space
      .replace(/\*/g, '<br>')       // Replace '*' with line break
      .replace(/(Likely Diagnosis)/g, '<strong><br>$1</strong>') // Bold "Likely Diagnosis:"
      .replace(/(Medical Prescription)/g, '<br><strong>$1</strong>') // Bold "Medical Prescription:"
      .replace(/(Precautions)/g, '<br><strong>$1</strong>')         // Bold "Precautions:"
      .replace(/(Hospitals to Visit)/g, '<br><strong>$1</strong>');  // Bold "Hospitals to Visit:"

    return formattedText;
  };

  // Function to send a message
  const sendMessage = async () => {
    if (!message.trim() || isFinalResponse) return; // Don't send empty messages or allow messages after final response

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5005/chat", {
        message,
      });

      let botResponse = response.data.response;

      // Format the bot response using updateMessage function
      botResponse = updateMessage(botResponse);

      // Remove 'number: ' (e.g., '1: ', '2: ') from responses
      botResponse = botResponse.replace(/\d+:\s/g, '').trim();

      // Remove 'number. ' in the question responses
      botResponse = botResponse.replace(/\d+\.\s/g, '').trim();

      const updatedChatHistory = [...chatHistory, { user: message, bot: botResponse }];
      setChatHistory(updatedChatHistory);
      setMessage("");

      // If final response is received, block user input and display refresh button
      if (botResponse.includes("Thank you for using the AI Doctor")) {
        setIsFinalResponse(true);

        // Extract prescription text for download
        const plainText = botResponse.replace(/<[^>]*>/g, ""); // Strip HTML tags
        setPrescriptionText(plainText);
      }
    } catch (error) {
      console.error("Error:", error);
      setChatHistory((prev) => [
        ...prev,
        { user: message, bot: "Sorry, something went wrong. Please try again." },
      ]);
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  // Function to handle prescription download
  const handleDownload = () => {
    const blob = new Blob([prescriptionText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Prescription.docx";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Function to refresh the page
  const handleRefresh = () => {
    window.location.reload();
  };

  // Auto-scroll to the bottom of the chat box when a new message is added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]); // Trigger auto-scroll whenever chatHistory changes

  // Auto-focus on the input field after a new message is loaded
  useEffect(() => {
    if (inputRef.current && !isFinalResponse) {
      inputRef.current.focus();
    }
  }, [chatHistory, isFinalResponse]); 
  return (
    <div>
      <br></br>
      <div className="App">
        <div className="chat-container">
          {/* Chat Header */}
          <div className="chat-header">
            <h2>AI Doctor Chatbot</h2>
            <p>Your virtual health assistant</p>
          </div>

          {/* Chat Box with auto-scroll */}
          <div className="chat-box" ref={chatBoxRef}>
            {chatHistory.map((chat, index) => (
              <div key={index} className="message">
                <div className="user-message">
                  {chat.user}&nbsp;
                  <img src={userLogo} alt="User" className="message-logo" />
                </div>
                <div className="bot-message">
                  <img src={aiLogo} alt="AI Doctor" className="message-logo2" />
                  &nbsp;
                  <span dangerouslySetInnerHTML={{ __html: chat.bot }} />
                </div>
              </div>
            ))}
            {loading && <div className="loading-text">AI Doctor is thinking...</div>}
          </div>

          {/* Input Container */}
          <div className="input-containerc">
            <input
              ref={inputRef} // Add ref to the input field
              className="inputc"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown} // Add onKeyDown event listener
              placeholder="Type your message..."
              disabled={isFinalResponse || loading}  // Disable input while loading or after final response
            />
            <button className="buttonc" onClick={sendMessage} disabled={isFinalResponse || loading}>Send</button>
          </div>

          {/* Final Response Section */}
          {isFinalResponse && (
            <div className="refresh-container">
              <p className="completion-message">Your session has completed. Thank you for using the AI Doctor!</p>
              <div className="button-group">
                <button className="download-button" onClick={handleDownload}>Download Prescription</button>
                <button onClick={handleRefresh}>Refresh</button><br />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useClient, useCanMessage, useStartConversation, useSendMessage, useStreamMessages } from '@xmtp/react-sdk';

const XMTPConversationModal = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const { client } = useClient();
  const { canMessage } = useCanMessage();
  const { startConversation } = useStartConversation();
  const { sendMessage } = useSendMessage();

  const peerAddress = '0x292934dbE5fb4423Ce2C5AB18f20918aAA6f1a76'; // Static peer address

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Callback to handle incoming messages
  const onMessage = useCallback((message) => {
    setMessages((prevMessages) => {
      // Check if the message is already in the state
      const isDuplicate = prevMessages.some(
        (msg) => msg.id === message.id
      );
      if (isDuplicate) {
        return prevMessages;
      }
      return [...prevMessages, message];
    });
  }, []);

  // Use the useStreamMessages hook to listen for new messages
  useStreamMessages(conversation, { onMessage });

  useEffect(() => {
    const initConversation = async () => {
      setIsLoading(true);
      try {
        const canMessagePeer = await canMessage(peerAddress);
        if (!canMessagePeer) {
          setError('This address is not on the XMTP network.');
          setIsLoading(false);
          return;
        }

        // Try to find an existing conversation
        const conversations = await client.conversations.list();
        const existingConversation = conversations.find(
          (conv) => conv.peerAddress === peerAddress
        );

        if (existingConversation) {
          setConversation(existingConversation);
          // Fetch conversation history
          const history = await existingConversation.messages();
          setMessages(history);
        } else {
          // If no existing conversation, start a new one without sending a message
          const newConversation = await client.conversations.newConversation(peerAddress);
          setConversation(newConversation);
        }
      } catch (err) {
        console.error('Error initializing conversation:', err);
        setError('Failed to initialize conversation. Please try again.');
      }
      setIsLoading(false);
    };

    if (client) {
      initConversation();
    }
  }, [client, canMessage, peerAddress]);

  const handleSendMessage = async () => {
    if (!message.trim() || !conversation) return;

    try {
      const sentMessage = await sendMessage(conversation, message);
      setMessages((prevMessages) => {
        // Check if the message is already in the state
        const isDuplicate = prevMessages.some(
          (msg) => msg.id === sentMessage.id
        );
        if (isDuplicate) {
          return prevMessages;
        }
        return [...prevMessages, sentMessage];
      });
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  if (isLoading) {
    return <div>Loading conversation...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-bold mb-4">XMTP Conversation</h2>
        <div className="flex-grow overflow-y-auto mb-4">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.senderAddress === client.address ? 'text-right' : 'text-left'}`}>
              <span className="bg-gray-200 rounded px-2 py-1 inline-block">
                {msg.content}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow border rounded-l px-2 py-1"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white px-4 py-1 rounded-r"
          >
            Send
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-gray-300 text-black px-4 py-1 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default XMTPConversationModal;

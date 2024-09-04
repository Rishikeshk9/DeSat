import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  useCanMessage,
  useStartConversation,
  useStreamMessages,
  useSendMessage,
} from '@xmtp/react-sdk';
import Button from './Button';

const XMTPConversationModal = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

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
        const newConversation = await startConversation(peerAddress, 'Hi');
        console.log('newConversation', newConversation);
        setConversation(newConversation);
        setMessages([
          { content: 'Hi', senderAddress: newConversation?.clientAddress },
        ]);
      } catch (err) {
        console.error('Error starting conversation:', err);
        setError('Failed to start conversation. Please try again.');
      }
      setIsLoading(false);
    };

    initConversation();
  }, [canMessage, startConversation, peerAddress]);

  const onMessage = useCallback((message) => {
    console.log('New message received:', message);
    setMessages((prevMessages) => {
      // Check if the message already exists in the array
      const messageExists = prevMessages.some((msg) => msg.id === message.id);
      if (!messageExists) {
        return [...prevMessages, message];
      }
      return prevMessages;
    });
  }, []);

  useStreamMessages(conversation?.conversation, { onMessage });

  const handleSendMessage = useCallback(async () => {
    if (message.trim() && conversation) {
      setIsLoading(true);
      try {
        const sentMessage = await sendMessage(
          conversation?.conversation,
          message
        );
        // Remove this line to prevent adding the sent message manually
        // setMessages((prevMessages) => [
        //   ...prevMessages,
        //   { ...sentMessage, senderAddress: conversation?.clientAddress },
        // ]);
        setMessage('');
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message. Please try again.');
      }
      setIsLoading(false);
    }
  }, [message, conversation, sendMessage]);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-[#21262D] p-6 rounded-lg w-96 max-h-[80vh] flex flex-col'>
        <h2 className='mb-4 text-2xl font-bold text-white'>
          Launch Satellite Chat
        </h2>
        <div className='flex-grow mb-4 overflow-y-auto'>
          {messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`mb-2  ${
                msg.senderAddress === peerAddress
                  ? 'text-left text-black'
                  : 'text-right text-white'
              }`}
            >
              <span
                className={`inline-block p-2 rounded ${
                  msg.senderAddress === peerAddress ? 'bg-white' : 'bg-black'
                }`}
              >
                {msg.content}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {error && <p className='mb-4 text-red-500'>{error}</p>}
        <div className='flex'>
          <input
            className='flex-grow p-2 mr-2 bg-[#30363D] text-white rounded'
            type='text'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Type a message...'
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
          >
            Send
          </Button>
        </div>
        <Button onClick={onClose} className='mt-4'>
          Close
        </Button>
      </div>
    </div>
  );
};

export default XMTPConversationModal;

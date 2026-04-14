import { Send, Paperclip, Image, Search } from 'lucide-react';
import { useState } from 'react';





export function MessagingPanel() {
  const [selectedConvo, setSelectedConvo] = useState('1');
  const [messageText, setMessageText] = useState('');

  const conversations = [
    {
      id: '1',
      patientName: 'Sarah Johnson',
      avatar: 'SJ',
      lastMessage: 'Thank you for the prescription',
      timestamp: '10 min ago',
      unread: 2,
      status: 'active'
    },
    {
      id: '2',
      patientName: 'Michael Chen',
      avatar: 'MC',
      lastMessage: 'Can I reschedule tomorrow\'s appointment?',
      timestamp: '1 hour ago',
      unread: 1,
      status: 'active'
    },
    {
      id: '3',
      patientName: 'Emma Davis',
      avatar: 'ED',
      lastMessage: 'My blood pressure readings are attached',
      timestamp: '2 hours ago',
      unread: 2,
      status: 'active'
    },
    {
      id: '4',
      patientName: 'James Wilson',
      avatar: 'JW',
      lastMessage: 'Sounds good, see you next week',
      timestamp: 'Yesterday',
      unread: 0,
      status: 'resolved'
    }
  ];

  const messages = [
    {
      id: '1',
      sender: 'patient',
      text: 'Good morning Dr. Smith, I wanted to follow up on my last visit.',
      timestamp: '9:45 AM'
    },
    {
      id: '2',
      sender: 'doctor',
      text: 'Good morning Sarah! How are you feeling? Have you started the new medication?',
      timestamp: '9:48 AM'
    },
    {
      id: '3',
      sender: 'patient',
      text: 'Yes, I started it on Monday. I\'ve been taking it as prescribed.',
      timestamp: '9:50 AM'
    },
    {
      id: '4',
      sender: 'patient',
      text: 'I did have a question about the dosage though.',
      timestamp: '9:50 AM'
    },
    {
      id: '5',
      sender: 'doctor',
      text: 'Of course, what would you like to know?',
      timestamp: '9:52 AM'
    },
    {
      id: '6',
      sender: 'patient',
      text: 'Here are my blood pressure readings from this morning',
      timestamp: '9:55 AM',
      attachments: ['bp_reading.jpg']
    }
  ];

  const handleSend = () => {
    if (messageText.trim()) {
      setMessageText('');
    }
  };

  return (
    <div className="flex-1 flex h-screen bg-white">
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {conversations.map(convo => (
            <div
              key={convo.id}
              onClick={() => setSelectedConvo(convo.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                selectedConvo === convo.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                  {convo.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="truncate">{convo.patientName}</h3>
                    {convo.unread > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {convo.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{convo.lastMessage}</p>
                  <p className="text-xs text-gray-400 mt-1">{convo.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                SJ
              </div>
              <div>
                <h3>Sarah Johnson</h3>
                <p className="text-sm text-gray-600">Active now</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                View Profile
              </button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Mark Resolved
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md ${msg.sender === 'doctor' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'} rounded-2xl px-4 py-3 shadow-sm`}>
                  <p className="text-sm">{msg.text}</p>
                  {msg.attachments && (
                    <div className="mt-2 space-y-2">
                      {msg.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                          <Image className="w-4 h-4" />
                          <span className="text-sm">{file}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className={`text-xs mt-1 ${msg.sender === 'doctor' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                🔒 All messages are end-to-end encrypted and HIPAA compliant
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3">
              <button className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Image className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={1}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!messageText.trim()}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Messages are monitored for quality and compliance purposes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}






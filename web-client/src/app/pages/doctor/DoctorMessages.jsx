import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Send, User, MoreVertical, Paperclip } from 'lucide-react';
import { mockMessages } from '../../data/mockDashboardData';

export default function DoctorMessages() {
  const [activeChat, setActiveChat] = useState(mockMessages[0]);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello Doctor, I have been feeling better.", type: "received" },
    { id: 2, text: "Glad to hear that. Keep taking the meds for another 2 days.", type: "sent" },
    { id: 3, text: "Should I schedule another follow up?", type: "received" },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages([...messages, { id: Date.now(), text: inputMsg, type: "sent" }]);
    setInputMsg('');
  };

  return (
    <div className="grid grid-cols-12 h-[calc(100vh-12rem)] gap-0 border border-border/50 rounded-[48px] overflow-hidden bg-card/50 backdrop-blur-xl shadow-2xl">
      {/* Inbox List */}
      <div className="col-span-4 border-r border-border/50 flex flex-col bg-card">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-2xl font-bold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-10 rounded-full bg-muted/50 border-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {mockMessages.map((msg) => (
            <div 
              key={msg.id}
              onClick={() => setActiveChat(msg)}
              className={`p-6 cursor-pointer border-b border-border/10 transition-colors flex gap-4 items-start ${
                activeChat.id === msg.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-muted/30'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                {msg.sender.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold truncate">{msg.sender}</span>
                  <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                </div>
                <p className={`text-sm truncate ${msg.unread ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* active chat */}
      <div className="col-span-8 flex flex-col items-stretch bg-card/30">
        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-card">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
               {activeChat.sender.charAt(0)}
             </div>
             <div>
               <div className="font-bold">{activeChat.sender}</div>
               <div className="text-xs text-green-500 font-medium">Online</div>
             </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="w-5 h-5" /></Button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
           {messages.map((m) => (
             <div key={m.id} className={`flex ${m.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[70%] p-4 rounded-3xl shadow-sm text-sm ${
                 m.type === 'sent' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border border-border rounded-tl-none'
               }`}>
                 {m.text}
               </div>
             </div>
           ))}
        </div>

        <div className="p-6 bg-card border-t border-border/50">
          <form onSubmit={handleSend} className="flex gap-4">
             <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground"><Paperclip className="w-5 h-5" /></Button>
             <Input 
               placeholder="Type a message..." 
               value={inputMsg}
               onChange={(e) => setInputMsg(e.target.value)}
               className="rounded-full bg-muted/30 border-none px-6"
             />
             <Button type="submit" disabled={!inputMsg.trim()} size="icon" className="rounded-full bg-primary hover:bg-accent h-12 w-12 shrink-0">
               <Send className="w-5 h-5" />
             </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

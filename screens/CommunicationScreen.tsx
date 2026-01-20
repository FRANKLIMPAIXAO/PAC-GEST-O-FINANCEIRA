
import React, { useState } from 'react';
import { 
  Search, Paperclip, Mic, Send, MoreVertical, Phone, Video, 
  Check, CheckCheck, FileText, Image as ImageIcon, DollarSign,
  AlertCircle, Briefcase, File, Plus
} from 'lucide-react';
import { MOCK_CHATS } from '../constants';
import { Conversation, ChatMessage } from '../types';

const CommunicationScreen: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string>(MOCK_CHATS[0].id);
  const [inputText, setInputText] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  const selectedChat = MOCK_CHATS.find(c => c.id === selectedChatId) || MOCK_CHATS[0];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    // In a real app, this would push to backend
    // Here we just clear input to simulate
    setInputText('');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Ativo': return 'bg-green-500';
      case 'Em atraso': return 'bg-red-500';
      case 'Pendência Doc': return 'bg-orange-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Left Sidebar: Inbox */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Caixa de Entrada</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente ou mensagem..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['Todos', 'Geral', 'Financeiro', 'Contratos', 'Solicitações'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {MOCK_CHATS.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50 ${
                selectedChatId === chat.id ? 'bg-blue-50/60 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 truncate max-w-[140px]">{chat.clientName}</span>
                  {chat.isUrgent && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded">URGENTE</span>
                  )}
                </div>
                <span className="text-xs text-slate-400">{chat.lastMessageTime}</span>
              </div>
              <p className="text-sm text-slate-500 truncate mb-2">{chat.lastMessage}</p>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                  {chat.category}
                </span>
                {chat.unreadCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Area: Chat Window */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        
        {/* Chat Header */}
        <div className="h-16 px-6 bg-white border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                {selectedChat.clientName.charAt(0)}
             </div>
             <div>
               <h3 className="font-bold text-slate-900">{selectedChat.clientName}</h3>
               <div className="flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full ${getStatusColor(selectedChat.status)}`}></span>
                 <span className="text-xs text-slate-500">{selectedChat.status}</span>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
               <Phone size={20} />
             </button>
             <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
               <Video size={20} />
             </button>
             <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
               <MoreVertical size={20} />
             </button>
             <button className="ml-2 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2">
               <Check size={16} /> Resolver
             </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
           {selectedChat.messages.map((msg) => (
             <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
               <div className={`flex flex-col max-w-[70%] ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                 
                 {/* Message Bubble */}
                 <div className={`p-3 rounded-2xl shadow-sm relative group ${
                   msg.sender === 'me' 
                     ? 'bg-blue-600 text-white rounded-tr-none' 
                     : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                 }`}>
                   {msg.type === 'text' && <p className="text-sm leading-relaxed">{msg.content}</p>}
                   
                   {msg.type === 'pdf' && (
                     <div className="flex items-center gap-3 p-1">
                       <div className="bg-red-100 p-2 rounded text-red-600">
                         <FileText size={24} />
                       </div>
                       <div>
                         <p className="text-sm font-medium">{msg.attachmentName}</p>
                         <p className={`text-xs ${msg.sender === 'me' ? 'text-blue-200' : 'text-slate-400'}`}>PDF Document</p>
                       </div>
                     </div>
                   )}

                   {msg.type === 'image' && (
                     <div className="space-y-1">
                       {msg.content && <p className="text-sm mb-1">{msg.content}</p>}
                       <div className="bg-slate-100 rounded-lg p-1 flex items-center justify-center">
                         <ImageIcon size={32} className="text-slate-400" />
                         <span className="ml-2 text-xs text-slate-500">{msg.attachmentName}</span>
                       </div>
                     </div>
                   )}

                   <span className={`text-[10px] mt-1 block text-right opacity-70 ${msg.sender === 'me' ? 'text-blue-100' : 'text-slate-400'}`}>
                     {msg.timestamp}
                   </span>
                 </div>

                 {/* System Smart Actions (Integration Logic) */}
                 {msg.actionRequired === 'register_payment' && (
                   <div className="mt-2 bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-center justify-between gap-4 w-full shadow-sm animate-in fade-in slide-in-from-top-2">
                     <div className="flex items-center gap-2">
                       <DollarSign className="text-yellow-600" size={18} />
                       <span className="text-xs font-medium text-yellow-800">Comprovante detectado. Registrar pagamento?</span>
                     </div>
                     <div className="flex gap-2">
                       <button className="text-xs text-slate-500 hover:text-slate-800">Depois</button>
                       <button className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded hover:bg-yellow-200">
                         Sim, Registrar
                       </button>
                     </div>
                   </div>
                 )}

                 {/* Read Receipts */}
                 {msg.sender === 'me' && (
                   <div className="mt-1 mr-1">
                     {msg.isRead ? <CheckCheck size={14} className="text-blue-400" /> : <Check size={14} className="text-slate-300" />}
                   </div>
                 )}
               </div>
             </div>
           ))}
        </div>

        {/* Quick Actions Bar */}
        <div className="px-6 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full text-xs font-medium text-slate-600 transition-colors border border-slate-200">
            <DollarSign size={14} /> Cobrança Mês
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full text-xs font-medium text-slate-600 transition-colors border border-slate-200">
            <FileText size={14} /> Link NFS-e
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full text-xs font-medium text-slate-600 transition-colors border border-slate-200">
            <Briefcase size={14} /> Solicitar Doc
          </button>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex items-end gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
             <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors">
               <Paperclip size={20} />
             </button>
             <textarea 
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               placeholder="Digite sua mensagem..." 
               className="flex-1 bg-transparent resize-none border-none focus:ring-0 max-h-32 text-slate-800 text-sm py-2"
               rows={1}
               style={{ minHeight: '40px' }}
             />
             <div className="flex items-center gap-1">
               <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors">
                 <Mic size={20} />
               </button>
               <button 
                 onClick={handleSendMessage}
                 className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
               >
                 <Send size={18} />
               </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CommunicationScreen;

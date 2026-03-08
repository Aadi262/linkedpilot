"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Send, Loader2, ExternalLink, Tag, X, PauseCircle, Clock, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/ui/page-transition";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  direction: "sent" | "received";
  content: string;
  sentAt: string;
}

interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  profileUrl: string;
  initials: string;
  color: string;
  campaign: string;
  account: string;
  connectionDate: string;
  tags: string[];
  notes: string;
  outreachPaused: boolean;
  journey: { label: string; date: string; done: boolean }[];
}

interface Conversation {
  id: string;
  lead: Lead;
  messages: Message[];
  unread: number;
  lastMessage: string;
  lastTime: string;
}

// ─── Stub data ────────────────────────────────────────────────────────────────

const STUB_CONVERSATIONS: Conversation[] = [
  {
    id: "conv_1",
    unread: 2,
    lastMessage: "Thanks for reaching out! I'd love to learn more.",
    lastTime: "2m ago",
    lead: {
      id: "l1", name: "Emma Wilson", title: "VP Sales", company: "GrowthCo",
      profileUrl: "https://linkedin.com/in/emma-wilson", initials: "EW", color: "bg-green-600",
      campaign: "Q1 SaaS Founders", account: "Sarah Kim",
      connectionDate: "Feb 28, 2026",
      tags: ["hot-lead", "decision-maker"],
      notes: "Very responsive. Interested in agency pricing.",
      outreachPaused: true,
      journey: [
        { label: "Connection Sent", date: "Feb 26", done: true },
        { label: "Connection Accepted", date: "Feb 28", done: true },
        { label: "Message Sent", date: "Mar 1", done: true },
        { label: "Replied", date: "Mar 3", done: true },
      ],
    },
    messages: [
      { id: "m1", direction: "sent", content: "Hi Emma, I came across your profile and loved your work at GrowthCo. Would love to connect!", sentAt: "Feb 26, 9:12am" },
      { id: "m2", direction: "sent", content: "Thanks for connecting, Emma! I wanted to share something that might be relevant for GrowthCo — we help sales teams scale LinkedIn outreach across multiple accounts safely. Would a quick chat be worthwhile?", sentAt: "Mar 1, 10:30am" },
      { id: "m3", direction: "received", content: "Thanks for reaching out! I'd love to learn more.", sentAt: "Mar 3, 2:15pm" },
      { id: "m4", direction: "received", content: "Can we set up a 20-minute call this week?", sentAt: "Mar 3, 2:16pm" },
    ],
  },
  {
    id: "conv_2",
    unread: 0,
    lastMessage: "Sounds interesting. Send me a deck?",
    lastTime: "1h ago",
    lead: {
      id: "l2", name: "David Chen", title: "CEO", company: "TechFlow",
      profileUrl: "https://linkedin.com/in/david-chen", initials: "DC", color: "bg-violet-600",
      campaign: "Series A Startups NYC", account: "Mike Rodriguez",
      connectionDate: "Feb 24, 2026",
      tags: ["series-a"],
      notes: "",
      outreachPaused: false,
      journey: [
        { label: "Connection Sent", date: "Feb 22", done: true },
        { label: "Connection Accepted", date: "Feb 24", done: true },
        { label: "Message Sent", date: "Feb 27", done: true },
        { label: "Replied", date: "Mar 3", done: true },
      ],
    },
    messages: [
      { id: "m5", direction: "sent", content: "Hi David, saw TechFlow raised a Series A — congrats! We help fast-growing teams scale LinkedIn outreach. Worth a chat?", sentAt: "Feb 27, 11:00am" },
      { id: "m6", direction: "received", content: "Sounds interesting. Send me a deck?", sentAt: "Mar 3, 9:45am" },
    ],
  },
  {
    id: "conv_3",
    unread: 1,
    lastMessage: "Not interested right now, maybe Q3.",
    lastTime: "3h ago",
    lead: {
      id: "l3", name: "Lisa Park", title: "Head of Marketing", company: "Nexus Labs",
      profileUrl: "https://linkedin.com/in/lisa-park", initials: "LP", color: "bg-blue-600",
      campaign: "Agency Decision Makers", account: "Sarah Kim",
      connectionDate: "Feb 20, 2026",
      tags: ["cold-lead"],
      notes: "Follow up in Q3.",
      outreachPaused: false,
      journey: [
        { label: "Connection Sent", date: "Feb 18", done: true },
        { label: "Connection Accepted", date: "Feb 20", done: true },
        { label: "Message Sent", date: "Feb 23", done: true },
        { label: "Follow-up Sent", date: "Mar 2", done: true },
        { label: "Replied", date: "Mar 3", done: true },
      ],
    },
    messages: [
      { id: "m7", direction: "sent", content: "Hi Lisa, I help marketing leaders at agencies scale their LinkedIn outreach. Open to a quick chat?", sentAt: "Feb 23, 2:00pm" },
      { id: "m8", direction: "sent", content: "Hey Lisa, just bumping this in case it got buried — happy to share a quick overview if it's relevant.", sentAt: "Mar 2, 10:00am" },
      { id: "m9", direction: "received", content: "Not interested right now, maybe Q3.", sentAt: "Mar 3, 4:30pm" },
    ],
  },
  {
    id: "conv_4",
    unread: 0,
    lastMessage: "Great to connect! Looking forward to it.",
    lastTime: "Yesterday",
    lead: {
      id: "l4", name: "James White", title: "Founder", company: "SaaSly",
      profileUrl: "https://linkedin.com/in/james-white", initials: "JW", color: "bg-orange-600",
      campaign: "Q1 SaaS Founders", account: "Mike Rodriguez",
      connectionDate: "Mar 1, 2026",
      tags: ["warm"],
      notes: "Booked a demo for March 10.",
      outreachPaused: true,
      journey: [
        { label: "Connection Sent", date: "Feb 28", done: true },
        { label: "Connection Accepted", date: "Mar 1", done: true },
        { label: "Message Sent", date: "Mar 2", done: true },
        { label: "Replied", date: "Mar 2", done: true },
      ],
    },
    messages: [
      { id: "m10", direction: "sent", content: "Hi James, building in the SaaS space is no joke. We help founders scale outreach across multiple LinkedIn accounts safely. Worth 15 minutes?", sentAt: "Mar 2, 9:00am" },
      { id: "m11", direction: "received", content: "Great to connect! Looking forward to it.", sentAt: "Mar 2, 11:00am" },
    ],
  },
];

const FILTER_TABS = ["All", "Unread", "Replied", "Needs Action"] as const;
type FilterTab = typeof FILTER_TABS[number];

// ─── Component ────────────────────────────────────────────────────────────────

export default function InboxPage() {
  const [selected, setSelected] = useState<string>(STUB_CONVERSATIONS[0].id);
  const [filter, setFilter] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState(STUB_CONVERSATIONS);
  const [newTag, setNewTag] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConv = conversations.find((c) => c.id === selected);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected, conversations]);

  // Mark as read when opened
  useEffect(() => {
    if (selected) {
      setConversations((prev) =>
        prev.map((c) => c.id === selected ? { ...c, unread: 0 } : c)
      );
    }
  }, [selected]);

  const filteredConvs = conversations.filter((c) => {
    const matchesSearch = c.lead.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lead.company.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      (filter === "Unread" && c.unread > 0) ||
      (filter === "Replied" && c.messages.some((m) => m.direction === "received")) ||
      (filter === "Needs Action" && c.messages[c.messages.length - 1]?.direction === "received" && !c.lead.outreachPaused);
    return matchesSearch && matchesFilter;
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  const handleSend = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000)); // stub delay

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      direction: "sent",
      content: reply.trim(),
      sentAt: "Just now",
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: reply.trim(), lastTime: "Just now" }
          : c
      )
    );
    setReply("");
    setSending(false);
  };

  const togglePause = () => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected
          ? { ...c, lead: { ...c.lead, outreachPaused: !c.lead.outreachPaused } }
          : c
      )
    );
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected
          ? { ...c, lead: { ...c.lead, tags: [...c.lead.tags, newTag.trim()] } }
          : c
      )
    );
    setNewTag("");
    setAddingTag(false);
  };

  const removeTag = (tag: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected
          ? { ...c, lead: { ...c.lead, tags: c.lead.tags.filter((t) => t !== tag) } }
          : c
      )
    );
  };

  const updateNotes = (notes: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected ? { ...c, lead: { ...c.lead, notes } } : c
      )
    );
  };

  return (
    <PageTransition>
    <div className="h-[calc(100vh-5rem)] flex rounded-xl border border-white/10 overflow-hidden">

      {/* ── Column 1: Conversation List ── */}
      <div className="w-72 flex-shrink-0 border-r border-white/10 flex flex-col bg-white/[0.02]">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Inbox</h2>
            {totalUnread > 0 && (
              <span className="text-xs bg-violet-600 text-white rounded-full px-2 py-0.5 font-medium">
                {totalUnread} new
              </span>
            )}
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex px-3 pt-2 gap-0.5 border-b border-white/10 pb-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                filter === tab ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-300"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-600">No conversations match</div>
          ) : (
            filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelected(conv.id)}
                className={cn(
                  "w-full text-left px-4 py-3.5 border-b border-white/5 transition-all",
                  selected === conv.id
                    ? "bg-violet-600/15 border-l-2 border-l-violet-500"
                    : "hover:bg-white/[0.03]"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0", conv.lead.color)}>
                    {conv.lead.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={cn("text-xs font-semibold truncate", selected === conv.id ? "text-white" : "text-gray-200")}>
                        {conv.lead.name}
                      </span>
                      <span className="text-[10px] text-gray-600 flex-shrink-0">{conv.lastTime}</span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[11px] text-gray-500 truncate">{conv.lastMessage}</p>
                      {conv.unread > 0 && (
                        <span className="w-4 h-4 bg-violet-600 rounded-full text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="text-[9px] text-gray-700 truncate">{conv.lead.company}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Column 2: Message Thread ── */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Thread header */}
          <div className="h-14 border-b border-white/10 flex items-center px-5 gap-3 flex-shrink-0">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0", selectedConv.lead.color)}>
              {selectedConv.lead.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{selectedConv.lead.name}</span>
                <a
                  href={selectedConv.lead.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-violet-400 transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs text-gray-500 truncate">{selectedConv.lead.title} · {selectedConv.lead.company}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 border border-violet-600/30">
                {selectedConv.lead.campaign}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400 border border-white/10">
                via {selectedConv.lead.account}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {selectedConv.messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.direction === "sent" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-md rounded-2xl px-4 py-2.5 text-sm",
                  msg.direction === "sent"
                    ? "bg-violet-600 text-white rounded-br-sm"
                    : "bg-white/10 text-gray-200 rounded-bl-sm"
                )}>
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className={cn("text-[10px] mt-1.5", msg.direction === "sent" ? "text-violet-200" : "text-gray-500")}>
                    {msg.sentAt}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply input */}
          <div className="border-t border-white/10 p-4 flex-shrink-0">
            {selectedConv.lead.outreachPaused && (
              <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 mb-3">
                <PauseCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Automated outreach is paused for this lead. You can still reply manually.
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                rows={2}
                placeholder="Write a reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
                className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
              />
              <Button
                onClick={handleSend}
                disabled={!reply.trim() || sending}
                className="bg-violet-600 hover:bg-violet-700 text-white self-end h-10 px-4 gap-2"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-gray-700 mt-1.5">⌘+Enter to send · Reply is sent via {selectedConv.lead.account}&apos;s LinkedIn account</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 text-sm">Select a conversation</p>
        </div>
      )}

      {/* ── Column 3: Lead Details ── */}
      {selectedConv && (
        <div className="w-64 flex-shrink-0 border-l border-white/10 flex flex-col overflow-y-auto bg-white/[0.01]">
          {/* Lead info */}
          <div className="p-4 border-b border-white/10">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-white mx-auto mb-3", selectedConv.lead.color)}>
              {selectedConv.lead.initials}
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-white">{selectedConv.lead.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{selectedConv.lead.title}</div>
              <div className="text-xs text-gray-600">{selectedConv.lead.company}</div>
            </div>
            <a
              href={selectedConv.lead.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> View LinkedIn profile
            </a>
          </div>

          {/* Journey */}
          <div className="p-4 border-b border-white/10">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-3">Journey</p>
            <div className="space-y-2">
              {selectedConv.lead.journey.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0",
                    step.done
                      ? "bg-green-500/20 border-green-500/50"
                      : "bg-white/5 border-white/10"
                  )}>
                    {step.done && <div className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-[10px] font-medium truncate", step.done ? "text-gray-300" : "text-gray-600")}>
                      {step.label}
                    </div>
                    {step.done && <div className="text-[9px] text-gray-600">{step.date}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Tags</p>
              <button onClick={() => setAddingTag(true)} className="text-gray-600 hover:text-violet-400 transition-colors">
                <Tag className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedConv.lead.tags.map((tag) => (
                <div key={tag} className="flex items-center gap-1 px-1.5 py-0.5 bg-violet-600/20 rounded text-[10px] text-violet-300">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-violet-500 hover:text-red-400">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
            {addingTag && (
              <div className="flex gap-1 mt-2">
                <input
                  type="text"
                  placeholder="tag-name"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addTag(); if (e.key === "Escape") setAddingTag(false); }}
                  className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-[10px] text-white placeholder:text-gray-600 focus:outline-none"
                  autoFocus
                />
                <button onClick={addTag} className="text-green-400 hover:text-green-300 text-[10px] px-1">Add</button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="p-4 border-b border-white/10">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2">Notes</p>
            <textarea
              rows={3}
              placeholder="Add a note..."
              value={selectedConv.lead.notes}
              onChange={(e) => updateNotes(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-2.5 py-2 text-[11px] text-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />
            <p className="text-[9px] text-gray-700 mt-1">Saves on blur</p>
          </div>

          {/* Pause outreach toggle */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-gray-300">Pause outreach</p>
                <p className="text-[9px] text-gray-600 mt-0.5">Stop automated steps for this lead</p>
              </div>
              <button
                onClick={togglePause}
                className={cn(
                  "w-9 h-5 rounded-full transition-all relative",
                  selectedConv.lead.outreachPaused ? "bg-yellow-500" : "bg-white/20"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all",
                  selectedConv.lead.outreachPaused ? "left-4" : "left-0.5"
                )} />
              </button>
            </div>
            {selectedConv.lead.outreachPaused && (
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-yellow-400">
                <Clock className="w-3 h-3" /> Outreach paused
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  );
}

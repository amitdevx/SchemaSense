'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { formatISTTime } from '@/lib/utils';

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  isStreaming?: boolean;
}

export interface ChatResponse {
  question: string;
  answer: string;
  timestamp: string;
}

/**
 * Hook to handle chat functionality with streaming support
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hi! I'm SchemaSense AI. I can help you understand your database schema. Ask me anything about your tables, relationships, or data!",
      sender: 'ai',
      timestamp: formatISTTime(new Date()),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingStatus, setStreamingStatus] = useState<string>('');

  const sendMessage = async (question: string, connectionId?: string) => {
    if (!question.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: messages.length + 1,
      text: question,
      sender: 'user',
      timestamp: formatISTTime(new Date()),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    setStreamingStatus('');

    // Add AI message placeholder
    const aiMessageId = messages.length + 2;
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      text: '',
      sender: 'ai',
      timestamp: formatISTTime(new Date()),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, aiMessage]);

    try {
      // Use streaming endpoint with full API URL
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/x-ndjson',
        },
        body: JSON.stringify({ question, connection_id: connectionId || undefined }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        const detail = errData?.detail || `Server error (${response.status})`;
        if (response.status === 400 && detail.includes('No database connected')) {
          throw new Error('No database connected. Please connect a database from the Integrations page first.');
        }
        throw new Error(detail);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const json = JSON.parse(line);

            if (json.type === 'status') {
              // Show progress stage
              setStreamingStatus(json.message);
            } else if (json.type === 'content') {
              // Append content chunk
              fullContent += json.data;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId
                    ? { ...msg, text: fullContent, isStreaming: true }
                    : msg
                )
              );
            } else if (json.type === 'done') {
              // Finished streaming
              setStreamingStatus('');
            } else if (json.type === 'error') {
              setError(json.message);
            }
          } catch (e) {
            // Ignore JSON parse errors for incomplete messages
          }
        }
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to get response from AI';
      setError(errorMsg);

      // Remove placeholder and add error message
      setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId));

      const errorMessage: ChatMessage = {
        id: aiMessageId,
        text: `Error: ${errorMsg}`,
        sender: 'ai',
        timestamp: formatISTTime(new Date()),
      };

      setMessages((prev) => [...prev, errorMessage]);
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
      setStreamingStatus('');
    }
  };

  const clearMessages = () => {
    setMessages([
      {
        id: 1,
        text: "Hi! I'm SchemaSense AI. I can help you understand your database schema. Ask me anything about your tables, relationships, or data!",
        sender: 'ai',
        timestamp: formatISTTime(new Date()),
      },
    ]);
  };

  return {
    messages,
    loading,
    error,
    streamingStatus,
    sendMessage,
    clearMessages,
  };
}

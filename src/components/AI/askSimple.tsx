import React, { useState } from 'react';
import { Text, TextInput, Pressable, ScrollView, View, ActivityIndicator } from 'react-native';
import ErrorMessage from 'components/Meta/Error';
import { buildApiUrl } from '~/utils/apiConfig';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DetectedPokemon {
  id: number;
  name: string;
  type1: string;
  type2?: string;
}

export default function AskSimple() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! Ask me anything about Pokémon strategies and Tera Raids. Just mention a Pokémon name and I\'ll provide detailed advice!' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDetectedPokemon, setLastDetectedPokemon] = useState<DetectedPokemon | null>(null);

  const send = async () => {
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Call your backend - adjust URL as needed
            const response = await fetch(buildApiUrl('ai/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error from server');
      }

      // Update detected Pokémon if any
      if (data.data.detectedPokemon) {
        setLastDetectedPokemon(data.data.detectedPokemon);
      }

      // Append the AI's reply
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: data.data.reply 
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <ErrorMessage
        title="Chat Error"
        description="There was a problem with the AI chat."
        error={error}
      />
    );
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <ScrollView className="flex-1 mb-4">
        {messages.map((message, idx) => (
          <View 
            key={idx} 
            className={`mb-3 p-3 rounded-lg max-w-[80%] ${
              message.role === 'user' 
                ? 'self-end bg-blue-500' 
                : 'self-start bg-gray-200'
            }`}
          >
            <Text className={`text-base ${
              message.role === 'user' ? 'text-white' : 'text-black'
            }`}>
              {message.content}
            </Text>
          </View>
        ))}
        {loading && (
          <View className="flex-row items-center justify-center my-4">
            <ActivityIndicator size="small" color="#6366f1" />
            <Text className="ml-2 text-gray-600">AI is thinking...</Text>
          </View>
        )}
      </ScrollView>
      
      {lastDetectedPokemon && (
        <View className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <Text className="text-sm text-blue-800">
            🔍 Currently discussing: <Text className="font-semibold">{lastDetectedPokemon.name}</Text> 
            <Text className="text-xs"> (#{lastDetectedPokemon.id}, {lastDetectedPokemon.type1}{lastDetectedPokemon.type2 ? `/${lastDetectedPokemon.type2}` : ''})</Text>
          </Text>
        </View>
      )}
      
      <View className="flex-row items-center space-x-2">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about Pokémon strategies... (mention any Pokémon name for detailed info)"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base"
          multiline
          editable={!loading}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Pressable 
          onPress={send}
          disabled={loading || !input.trim()}
          className={`px-4 py-2 rounded-lg ${
            loading || !input.trim() 
              ? 'bg-gray-300' 
              : 'bg-blue-500'
          }`}
        >
          <Text className={`font-semibold ${
            loading || !input.trim() 
              ? 'text-gray-500' 
              : 'text-white'
          }`}>
            Send
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
import React, { useEffect, useRef, useState } from 'react';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { View, Text, FlatList, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity } from 'react-native';
import { useAuthStore } from '~/store/authStore';
import * as socialApi from '~/utils/socialApi';
import { Container } from 'components/UI/Container';

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<socialApi.Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [recipientUsername, setRecipientUsername] = useState('Conversation');
  const flatListRef = useRef<FlatList<socialApi.Message>>(null);

  useEffect(() => {
    const load = async () => {
      if (!conversationId) return;
      try {
        const msgs = await socialApi.getConversation(conversationId as string, 50, 0);
        setMessages(msgs.reverse());
        
        // Determine recipient username from messages
        if (msgs.length > 0 && user?.id) {
          // Find a message from the other person (not current user)
          const otherPersonMessage = msgs.find(msg => msg.senderId !== user.id);
          if (otherPersonMessage?.sender?.username) {
            setRecipientUsername(otherPersonMessage.sender.username);
          } else {
            // If all messages are from current user, try to get recipient from the last message
            const lastMessage = msgs[msgs.length - 1];
            if (lastMessage?.recipientId && lastMessage.recipientId !== user.id) {
              // Would need to fetch recipient profile, for now use a placeholder
              setRecipientUsername('Other User');
            }
          }
        }
      } catch (e) {
        console.error('Failed to load conversation:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [conversationId, user?.id]);

  const handleSend = async () => {
    if (!user?.id || !input.trim() || !messages) return;
    // derive recipient from last message (simplified: opposite of sender)
    const last = messages[messages.length - 1];
    const recipientId = last ? (last.senderId === user.id ? last.sender?.id ?? '' : last.senderId) : '';
    if (!recipientId) return;
    try {
      const sent = await socialApi.sendMessage(user.id, recipientId, input, { conversationId: conversationId as string });
      setMessages((prev) => [...prev, sent]);
      setInput('');
      requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: recipientUsername,
          headerBackTitle: 'Messages',
          presentation: 'card'
        }} 
      />
      <Container>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View className="flex-1">
            {loading ? (
              <View className="flex-1 items-center justify-center">
                <Text>Loading...</Text>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => {
                  const isMine = item.senderId === user?.id;
                  return (
                    <View className={`mb-2 ${isMine ? 'items-end' : 'items-start'}`}>
                      <View className={`max-w-[80%] px-4 py-2 rounded-2xl ${isMine ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        <Text className={`${isMine ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{item.content}</Text>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
          <View className="flex-row items-center p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a message"
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full px-4 py-3 mr-2"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity onPress={handleSend} className="bg-amber-500 px-5 py-3 rounded-full">
              <Text className="text-white font-semibold">Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Container>
    </>
  );
}

import ChatItem from "@/components/ChatItem";
import ChatTabs from "@/components/PageTabs";
import { Container } from "@/components/Container";
import { HeaderApp } from "@/components/Header";
import { chatData } from "@/data/chat-data";
import { FlatList } from "react-native";

export default function Tab() {
  const tabs = ["Open chats", "My friends"];

  return (
    <Container>
      <HeaderApp headerTitle="Chat" showIcon />
      <ChatTabs tabs={tabs} />
      <FlatList
        data={chatData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatItem chat={item} />}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
}

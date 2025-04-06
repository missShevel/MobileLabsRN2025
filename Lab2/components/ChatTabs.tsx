import React, { useState } from "react";
import styled from "styled-components/native";

const tabs = ["Open chats", "My friends"];

const ChatTabs = () => {
  const [active, setActive] = useState(tabs[0]);
  return (
    <TabContainer>
      {tabs.map((t, index) => {
        return (
          <Tab key={index} active={active === t} onPress={() => setActive(t)}>
            <TabText active={active === t}>{t}</TabText>
          </Tab>
        );
      })}
    </TabContainer>
  );
};

export default ChatTabs;

const TabContainer = styled.View`
  flex-direction: row;
  background-color: #303649;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 16px;
`;

const Tab = styled.TouchableOpacity<{ active?: boolean }>`
  flex: 1;
  padding: 10px;
  background-color: ${({ active }: { active: boolean }) =>
    active ? "#1C202C" : "transparent"};
  border-radius: 8px;
  align-items: center;
`;

const TabText = styled.Text<{ active?: boolean }>`
  color: ${({ active }: { active: boolean }) => (active ? "#fff" : "#9fa8ba")};
  font-weight: 600;
`;

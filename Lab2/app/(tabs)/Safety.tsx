import { Container } from "@/components/Container";
import { HeaderApp } from "@/components/Header";
import MenuList from "@/components/MenuList";
import PageTabs from "@/components/PageTabs";
import { useEffect, useState } from "react";
import styled from "styled-components/native";
// Banner Section
const BannerContainer = styled.View`
  align-items: center;
  margin-bottom: 30px;
  margin-top: 10px; /* Add some space from the header/tabs */
`;

const LoggedInText = styled.Text`
  color: #a0a0a0; /* Light greyish color */
  font-size: 14px;
  margin-bottom: 5px;
`;

const CodeText = styled.Text`
  color: #ffffff; /* White color */
  font-size: 48px; /* Large font size */
  font-weight: bold;
  letter-spacing: 5px; /* Add spacing between letters */
  margin-bottom: 20px;
`;

// Progress Bar
const ProgressBarContainer = styled.View`
  height: 8px; /* Height of the progress bar */
  width: 60%; /* Width relative to the BannerContainer */
  background-color: #2a3f50; /* Darker background for the track */
  border-radius: 4px;
  overflow: hidden; /* Ensures the fill stays within bounds */
  margin-bottom: 30px;
`;

const ProgressBarFill = styled.View`
  height: 100%;
  width: ${(props: { progress: number }) => props.progress}%; /* Dynamic width based on prop */
  background-color: #1a9fff; /* Blue color for the fill */
  border-radius: 4px;
`;

// Text Blocks
const InfoText = styled.Text`
  color: #c7c7c7; 
  font-size: 15px;
  margin-bottom: 20px;
  text-align: left;
`;

const TipText = styled(InfoText)` 
  color: #1a9fff; 
`;

export default function Tab() {
  const tabs = ["Guard", "Confirmations"];
  const menuItems = [
    { id: '1', title: 'Remove Authenticator' },
    { id: '2', title: 'My Recovery Code' },
    { id: '3', title: 'Help' },
  ];
  const [progress, setProgress] = useState(80); 
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev > 0 ? prev - (100/30) : 100)); // Decrease over 30s, then reset
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <Container>
      <HeaderApp headerTitle="Safety" showIcon={false} />
      <PageTabs tabs={tabs} />
      <BannerContainer>
        <LoggedInText>Logged in as player</LoggedInText>
        <CodeText>N5KCV</CodeText> 
        <ProgressBarContainer>
           <ProgressBarFill progress={progress} />
        </ProgressBarContainer>
      </BannerContainer>

      {/* Text Blocks */}
      <InfoText>
        You'll enter your code each time you enter your password to sign in to your Steam account.
      </InfoText>
      <TipText>
        Tip: If you don't share your PC, you can select "Remember my password" when you sign in to the PC client to enter your password and authenticator code less often.
      </TipText>
      <MenuList menuItems={menuItems}/>
    </Container>
  );
}

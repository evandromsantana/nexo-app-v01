import React from "react";
import { Button } from "react-native";

interface ProposeTradeButtonProps {
  onPress: () => void;
}

const ProposeTradeButton: React.FC<ProposeTradeButtonProps> = ({
  onPress,
}) => {
  return <Button title="Propor Troca" onPress={onPress} />;
};

export default ProposeTradeButton;
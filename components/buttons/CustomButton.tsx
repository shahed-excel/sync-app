
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const CustomButton = ({
  label,
  disabled,
  onPress,
  icon,
  color,
  item,
}: {
  label?: string;
  disabled?: boolean;
  onPress: Function;
  icon?: string;
  color?: string;
  deviceId?: string;
  item?: any;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled ? styles.buttonDisabled : styles.buttonEnabled,
      ]}
      disabled={disabled}
      onPress={() => !disabled && onPress(item)}
    >
      {icon && <Icon name={icon} size={15} color={color || "white"} />}
      {label && <Text style={styles.buttonText}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    margin: 1,
  },
  buttonEnabled: {
    backgroundColor: "purple",
  },
  buttonDisabled: {
    backgroundColor: "gray",
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default CustomButton;
